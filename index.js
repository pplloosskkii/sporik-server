var mqtt = require('mqtt');
//var devices = [];

var app = require('express')();
var http = require('http').Server(app);

var Dictionary = require('dictionaryjs');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://172.16.0.123:8000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


console.log('initting');
//routes.listen(9009);


var client  = mqtt.connect('mqtt://172.16.0.123');

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
			console.log("measured: ", value);
			obj.lastMeasurementChange = new Date().valueOf();
			obj.measurementValue = value;
		},
		setState: function (state) {
			console.log("changing state from:", obj.state, "to:", state);
			obj.lastStateChange = new Date().valueOf();
			obj.state = state;
		},
		setRegulationValue: function (value) {
			console.log("regulated from: ", obj.regulationValue, "to:", value);
			obj.lastRegulationChange = new Date().valueOf();
			obj.regulationValue = value;
		},
		isAlive: function () {
			return (new Date().valueOf()) - obj.lastMeasurementChange < 30000; // older than 30s are dead
		},
	}

};


var DeviceList = function (mqtt) {
	var devices = new Dictionary();

	return {
		list: function () {
			return devices;
		},
		register: function (address) {
			if (!devices.has(address)) {
				devices.add(address, new Device(address));
			}

			mqtt.publish('sporik/register', '{"address": "' + address + '"}');
			return devices.get(address);
		}
	};
}

var devices = new DeviceList(client);


client.on('connect', function () {
	console.log('subscribing to all')
	client.subscribe('sporik/connect');
	client.subscribe('sporik/measurement');
	client.subscribe('sporik/state');
})

client.on('message', function (topic, message) {
	//console.log('got message in:', topic);
	var msg = JSON.parse(message.toString().trim());

	if (topic == 'sporik/connect') {
		devices.register(msg.address);
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

app.put('/api/toggle/:id',function(req,res){
	console.log('got toggle command for id', req.params.id);
	client.publish('sporik/toggle', '{"address": "' + req.params.id + '"}');
	res.json({"ok":true});
});

app.put('/api/regulate/:id/:value',function(req,res){
	console.log('got regulate command for id', req.params.id, 'value', req.params.value);
	client.publish('sporik/regulate', '{"address": "' + req.params.id + '", "value": ' + req.params.value + '}');
	res.json({"ok":true});
});

// Start and initialize the node server on local host port 8080
http.listen(9000,function(){
	console.log("Connected HTTP");
});
