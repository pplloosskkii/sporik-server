var mqtt = require('mqtt');
//var devices = [];

var app = require('express')();
var http = require('http').Server(app);

var Dictionary = require('dictionaryjs');
var devices = new Dictionary();

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
		lastMeasurement: null,
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
			obj.lastMeasurement = new Date().valueOf();
			obj.measurementValue = value;
		},
		setState: function (state) {
			console.log("changing state from:", obj.state, "to:", state);
			obj.lastStateChange = new Date().valueOf();
			obj.state = state;
		},
		isAlive: function () {
			return (new Date().valueOf()) - obj.lastMeasurement > 30; // older than 30s are dead
		},
	}

};


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
		devices.set(msg.address, new Device(msg.address));
		client.publish('sporik/register', '{"address": "' + msg.address + '"}');
	}

	if (topic == 'sporik/state') {
		if (!devices.has(msg.address)) {
			devices.add(msg.address, new Device(msg.address));
		}
		
		var device = devices.get(msg.address);
		device.setState(msg.state ? msg.state : msg.value);
	}

	if (topic == 'sporik/measurement') {

		if (!devices.has(msg.address)) {
			devices.add(msg.address, new Device(msg.address));
		}
		var device = devices.get(msg.address);
		device.setMeasurement(msg.value);
	}
})

app.get('/api/list',function(req, res){
	ret = [];
	devices.forEach(function(key, device) {
		if (device.isAlive()) {
			ret.push(device.get());
		}
	});
	res.json({"devices": ret});
});

app.get('/api/get/:id',function(req,res){
	var ret = devices.get(req.params.id);
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
