var mqtt = require('mqtt');
var app = require('express')();
var http = require('http').Server(app);
var Dictionary = require('dictionaryjs');
var bodyParser = require("body-parser");

var DEBUG = false;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

console.log('initting');

var reconnectAddresses = ['sporik0', 'sporik1'];

var client  = mqtt.connect('mqtt://192.168.1.99');

var Device = function (address) {  
	var obj = {
		address: null, 
		state: null, 
		lastStateChange: null,
		measurementValue: null, 
		lastMeasurementChange: null,
		regulationValue: null,
		lastRegulationChange: null,
	};

	obj.address = address;

	return {
		getParam: function(prop) {
			if (obj.hasOwnProperty(prop)) {
				return obj[prop];
			}
		},
		get: function() {
			return obj;
		},
		setMeasurement: function (value) {
			DEBUG && console.log(address + " measured: ", value);
			obj.lastMeasurementChange = new Date().valueOf();
			obj.measurementValue = value;
		},
		setState: function (state) {
			if (obj.state != state) {
				DEBUG && console.log(address + " changing state from:", obj.state, "to:", state);
				obj.lastStateChange = new Date().valueOf();
				obj.state = state;
			}
		},
		setRegulationValue: function (value) {
			if (obj.regulationValue != value) {
				DEBUG && console.log(address + " regulated from: ", obj.regulationValue, "to:", value);
				obj.lastRegulationChange = new Date().valueOf();
				obj.regulationValue = value;
			}
		},
		isAlive: function () {
			return (new Date().valueOf()) - obj.lastMeasurementChange < 30000; // older than 30s are dead
		},
	}
};


var DeviceRegulation = function () {
	return {
		tick: function () {

		},
	}
}




var DeviceList = function (mqtt) {
	var devices = new Dictionary();

	return {
		list: function () {
			return devices;
		},
		register: function (address, forcePublish) {
			if (!devices.has(address) || forcePublish === true) {
				devices.set(address, new Device(address));
				mqtt.publish('sporik/register', '{"address": "' + address + '"}');
			}

			return devices.get(address);
		}
	};
}

var Elmer = function () {
	var data = {};
	return {
		set: function (obj) {
			data = obj;
		},
		get: function() {
			return data;
		}
	}
}

// parse incoming message to json
function parseMessage(message) {
	var ret = {};
	try {
		ret = JSON.parse(message.toString().trim());
	} catch (e) {
		
	}
	return ret;
}

var devices = new DeviceList(client);
var elmer = new Elmer();


client.on('connect', function () {
	console.log('subscribing to all')
	client.subscribe('sporik/connect');
	client.subscribe('sporik/measurement');
	client.subscribe('sporik/relay-state');
	client.subscribe('sporik/triac-value');
	client.subscribe('sporik/elmer');

	// TODO MUST REMOVE SOON
	// should reconnect last-connected devices
	// or sort it in arduino
	for (var i in reconnectAddresses) {
		devices.register(reconnectAddresses[i]);
	}
})

client.on('message', function (topic, message) {
	DEBUG && console.log('got message in:', topic);
	var msg = parseMessage(message);
	
	
	if (topic == 'sporik/elmer') {
		elmer.set(msg);
	}

	if (topic == 'sporik/connect') {
		devices.register(msg.address, true);
	}

	if (topic == 'sporik/relay-state') {
		var device = devices.register(msg.address);
		device.setState(msg.state);
	}

	if (topic == 'sporik/triac-value') {
		var device = devices.register(msg.address);
		device.setRegulationValue(msg.value);
	}

	if (topic == 'sporik/measurement') {
		var device = devices.register(msg.address);
		device.setRegulationValue(msg.r);
		device.setState(msg.s);
		device.setMeasurement(msg.value);
	}
})

app.get('/api/list',function(req, res){
	ret = [];
	devices.list().forEach(function(key, device) {
		if (device.isAlive()) {
			ret.push(device.get());
		}
	});
	res.json({"devices": ret});
});

app.get('/api/get/:id',function(req,res){
	var ret = devices.list().get(req.params.id);
	if (typeof ret == 'undefined') {
		return res.status(404).json({ ok: false, reason: "404 Not Found" });
	}
	res.json(ret.get());
});

app.get('/api/elmer',function(req,res){
	res.json(elmer.get());
});

app.put('/api/toggle/:id',function(req,res){
	DEBUG && console.log('got toggle command for id', req.params.id);
	client.publish('sporik/toggle', '{"address": "' + req.params.id + '"}');
	res.json({"ok":true});
});

app.put('/api/regulate/:id/:value',function(req,res){
	DEBUG && console.log('got regulate command for id', req.params.id, 'value', req.params.value);
	client.publish('sporik/regulate', '{"address": "' + req.params.id + '", "value": ' + req.params.value + '}');
	res.json({"ok":true});
});

// Start and initialize the node server on local host port 8080
http.listen(9009,function(){
	console.log("Connected HTTP");
});
