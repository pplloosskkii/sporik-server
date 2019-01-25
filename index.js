//
// SPORIK APP
//
// server module


// EXPRESS
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require("body-parser");

// MQTT AND STUFF
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.99');
var mqttWrapper = require("./app/app/MqttWrapper")(client);

// MODEL
var devices = require("./app/app/DeviceList")(mqttWrapper);
var mqttSporikClient = require("./app/app/MqttClient")(mqttWrapper, devices);
var Elmer = require('./app/app/Elmer')();

// DATABASE
var db = require("./app/app/DeviceDb")();

// SCHEDULER
var schedule = require('node-schedule');


// other
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

console.log('Sporik Server Initting...');

app.get('/api/devices',function(req, res){
	ret = [];
	devices.list().forEach(function(key, device) {
		if (typeof device == 'undefined' || typeof device.isAlive != 'function' || !device.isAlive()) {
			// deregister device
			DEBUG && console.log("unregistering:", key);
			devices.unregister(key);
			return;
		}
		if (device.isAlive()) {
			ret.push(device.get());
		}
	});
	res.json({"devices": ret});
});

app.get('/api/devices/:id',function(req,res){
	var ret = devices.list().get(req.params.id);
	if (typeof ret == 'undefined') {
		return res.status(404).json({ ok: false, reason: "404 Not Found" });
	}
	res.json(ret.get());
});


app.put('/api/devices/:id/autorun/:value/:maximum',function(req,res){
	var ret = devices.list().get(req.params.id);
	if (typeof ret == 'undefined') {
		return res.status(404).json({ ok: false, reason: "404 Not Found" });
	}
	ret.setRegulationMode(parseInt(req.params.value), parseInt(req.params.maximum));
	res.json({"ok":true});
});

app.post('/api/devices/:id',function(req,res){
	var data = req.body;
	
	var device = devices.list().get(req.params.id);
	if (typeof device == 'undefined') {
		return res.status(404).json({ ok: false, reason: "404 Not Found" });
	}
	device.update(data);
	res.json({"ok":true});
});

// toggle on/off
app.put('/api/devices/:id/toggle',function(req,res){
	DEBUG && console.log('got toggle command for id', req.params.id);
	mqttWrapper.publish('sporik/toggle', '{"address": "' + req.params.id + '"}');
	res.json({"ok":true});
});

// set regulation value
app.put('/api/devices/:id/regulate/:value',function(req,res){
	DEBUG && console.log('got regulate command for id', req.params.id, 'value', req.params.value);
	mqttWrapper.publish('sporik/regulate', '{"address": "' + req.params.id + '", "value": ' + req.params.value + '}');
	res.json({"ok":true});
});

// device stats
app.get('/api/devices/:id/stats', function (req, res) {
	db.stats.fetchMonthlyStats(req.params.id, function (data) {
		res.json(data);
	});
});


// fetch elmer
app.get('/api/elmer',function(req,res){
	res.json(Elmer.get());
});

// kill server
app.get('/api/restart',function(req,res){
	process.exit();
});


var flushStats = schedule.scheduleJob('0,15,30,45 * * * *', function(){
	devices.flushStats();
});
var flushDailyStats = schedule.scheduleJob('1 0 * * *', function(){
	devices.flushDailyStats();
	Elmer.flushDailyStats();
});


// Start and initialize the node server on local host port
http.listen(9009,function(){
	console.log("HTTP Server ready.");
});
