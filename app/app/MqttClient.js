var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.99');
var DeviceList = require('./DeviceList');
var Elmer = require('./Elmer')();

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
	
	
	if (topic == 'sporik/elmer') {
		Elmer.set(msg);
	}

	if (topic == 'sporik/connect') {
		register(msg.address, true).then(function (device) {
		});
	}

	if (topic == 'sporik/relay-state') {
		devices.register(msg.address).then(function (device) {
			device.update({ 'state': msg.state });
		});
	}

	if (topic == 'sporik/triac-value') {
		devices.register(msg.address).then(function (device) {
			device.update({'regulation': msg.value });
		});
	}

	if (topic == 'sporik/measurement') {
		devices.register(msg.address).then(function (device) {
			device.update({ 'regulation': msg.r, 'state': msg.s, 'measurement': msg.value });
		});
	}
})


module.exports = client;