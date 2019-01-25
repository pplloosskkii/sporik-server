var Elmer = require('./Elmer')();
var DeviceRegulator = require('./DeviceRegulator')();
var DEBUG = require('./Debug');
var firstMeasurement = null; // first elmer measurement is remembered

// parse incoming message to json
function parseMessage(message) {
	var ret = {};
	try {
		ret = JSON.parse(message.toString().trim());
	} catch (e) {
		DEBUG.error("parseMesage error", e);
	}
	return ret;
}

function initialize(client, devices) {
	DEBUG.log('mqtt client initting');
	client.on('connect', function () {
		DEBUG.log('subscribing to all')
		client.subscribe('sporik/#');
		devices.reconnectAll();
	})

	client.on('message', function (topic, message) {
		var msg = parseMessage(message);
		DEBUG.log('->', topic, ' (', msg.address, ')');
		
		if (topic === 'sporik/elmer') {
			Elmer.set(msg);
			if (firstMeasurement === null) { // remember first measurement
				firstMeasurement = new Date();
				Elmer.setFirst();
			}
			DeviceRegulator.tick(Elmer, devices);
		}

		if (topic === 'sporik/connect') {
			devices.register(msg.address, true).then(function (device) {
				DEBUG.log(msg.address, "is connected");
				if (device.regulation > 0) {
					DEBUG.log(msg.address, " - setting last known state");
					device.updateSingle({'regulation': device.regulation });
				}
			});
		}

		if (topic === 'sporik/triac-value') {
			devices.get(msg.address).then(function (device) {
				device.updateSingle({'regulation': msg.value });
			});
		}

		if (topic === 'sporik/measurement') {
			devices.get(msg.address).then(function (device) {
				DEBUG.log("Storing measurements for ", msg.address);
				device.updateSingle({ 
					'regulation': msg.r,
					'measurement': (msg.i ? msg.i : msg.value)
				});
				device.setMeasurement(msg);
			});
		}

	});
	DEBUG.log('mqtt client initted');
}

module.exports = function (paramClient, paramDevices) {
	return initialize(paramClient, paramDevices);
};