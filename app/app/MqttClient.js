var Elmer = require('./Elmer')();
var DeviceRegulator = require('./DeviceRegulator')();
var DEBUG = require('./Debug');

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
		client.subscribe('sporik/connect');
		client.subscribe('sporik/measurement');
		client.subscribe('sporik/relay-state');
		client.subscribe('sporik/triac-value');
		client.subscribe('sporik/elmer');

		devices.reconnectAll();
	})

	client.on('message', function (topic, message) {
		var msg = parseMessage(message);
		DEBUG.log('->', topic, ' (', msg.address, ')');
		
		if (topic == 'sporik/elmer') {
			Elmer.set(msg);
			DeviceRegulator.tick(Elmer, devices);
		}

		if (topic == 'sporik/connect') {
			devices.register(msg.address, true).then(function (device) {
				DEBUG.log(msg.address, "is connected");
			});
		}

		if (topic == 'sporik/triac-value') {
			devices.register(msg.address).then(function (device) {
				device.updateSingle({'regulation': msg.value });
			});
		}

		if (topic == 'sporik/measurement') {
			devices.register(msg.address).then(function (device) {
				device.updateSingle({ 'regulation': msg.r, 'measurement': msg.value });
			});
		}
	});
	DEBUG.log('mqtt client initted');
}

module.exports = function (paramClient, paramDevices) {
	return initialize(paramClient, paramDevices);
};