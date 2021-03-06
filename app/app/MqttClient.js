var Elmer = require('./Elmer')();
var Elmer2 = require('./Elmer2')();
var DeviceRegulator = require('./DeviceRegulator2')();
var DEBUG = require('./Debug');
var firstMeasurement = null; // first elmer measurement is remembered

// parse incoming message to json
function parseMessage(message) {
	var ret = false;
	try {
		//console.log("parsing", message);
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
		if (!msg) return;
		DEBUG.log('->', topic, ' (', msg.address, ')');
		
		if (topic === 'sporik/elmer') {
			Elmer.set(msg);
			if (firstMeasurement === null) { // remember first measurement
				firstMeasurement = new Date();
				Elmer.setFirst();
			}
			DeviceRegulator.tick(Elmer, devices);
		}

		if (topic === 'sporik/elmer2') {
			Elmer2.set(msg);
			if (firstMeasurement === null) { // remember first measurement
				firstMeasurement = new Date();
				Elmer2.setFirst();
			}
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

		if (topic === 'sporik/error') {
			devices.get(msg.address).then(function (device) {
				device.setError(msg.error);
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