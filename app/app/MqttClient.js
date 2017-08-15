var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.99');
var DeviceList = require('./DeviceList');
var Elmer = require('./Elmer')();
var DeviceRegulator = require('./DeviceRegulator')();

var DEBUG = false;

// parse incoming message to json
function parseMessage(message) {
	var ret = {};
	try {
		ret = JSON.parse(message.toString().trim());
	} catch (e) {
		
	}
	return ret;
}

var devices = DeviceList(client);


client.on('connect', function () {
	console.log('subscribing to all')
	client.subscribe('sporik/connect');
	client.subscribe('sporik/measurement');
	client.subscribe('sporik/relay-state');
	client.subscribe('sporik/triac-value');
	client.subscribe('sporik/elmer');

	devices.reconnectAll();
})

client.on('message', function (topic, message) {
	DEBUG && console.log('got message in:', topic);
	var msg = parseMessage(message);
	DEBUG && console.log('from:', msg.address);
	
	if (DEBUG && msg.address == 'sporik6') {
		console.log(msg);
	}
	
	if (topic == 'sporik/elmer') {
		Elmer.set(msg);
		DeviceRegulator.tick(Elmer, devices);
	}

	if (topic == 'sporik/connect') {
		devices.register(msg.address, true).then(function (device) {
			console.log(msg.address, "is connected");
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
})


module.exports = client;