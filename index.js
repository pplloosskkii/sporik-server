//
// SPORIK APP
//
// server module


// EXPRESS
var app = require('express')();
var http = require('http');
var server = require('http').Server(app);
var bodyParser = require("body-parser");

// MQTT AND STUFF
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.99');
var mqttWrapper = require("./app/app/MqttWrapper")(client);

// MODEL
var devices = require("./app/app/DeviceList")(mqttWrapper);
var mqttSporikClient = require("./app/app/MqttClient")(mqttWrapper, devices);
var Elmer = require('./app/app/Elmer')();
var Elmer2 = require('./app/app/Elmer2')();

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

app.get('/api/devices', function(req, res){
	ret = [];
	devices.list().forEach(function(key, device) {
		if (typeof device == 'undefined' || typeof device.isAlive != 'function' || !device.isAlive()) {
			// deregister device
			DEBUG && console.log("unregistering:", key);
			devices.unregister(key);
			return;
		}
		//if (device.isAlive() || device.hasError()) {
		ret.push(device.get());
		//}
	});
	ret.sort(function (a, b) {
		if (a.priority >= 0 && b.priority >= 0 && a.priority < b.priority) return -1;
		if (a.priority >= 0 && b.priority >= 0 && a.priority > b.priority) return 1;
		return 0;
	});
	res.json({"devices": ret});
});

app.get('/api/devices/:id', function(req,res){
	var ret = devices.list().get(req.params.id);
	if (typeof ret == 'undefined') {
		return res.status(404).json({ ok: false, reason: "404 Not Found" });
	}
	res.json(ret.get());
});


app.put('/api/devices/:id/autorun/:value/:maximum', function(req,res){
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
	mqttWrapper.publish('sporik/toggle', '{"address":"' + req.params.id + '"}');
	res.json({"ok":true});
});

// set regulation value
app.put('/api/devices/:id/regulate/:value',function(req,res){
	DEBUG && console.log('got regulate command for id', req.params.id, 'value', req.params.value);
	mqttWrapper.publish('sporik/regulate', '{"address":"' + req.params.id + '","value":' + req.params.value + '}');
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

app.get('/api/elmer2',function(req,res){
	res.json(Elmer2.get());
});

app.get('/api/elmer/stats',function(req,res){
	db.stats.fetchWeeklyElmerStats(function (data) {
		res.json(data);
	});
});

// kill server
app.get('/api/restart',function(req,res){
	process.exit();
});

app.get('/api/inverter', function (req, res) {
	http.get('http://192.168.1.180/solar_api/v1/GetPowerFlowRealtimeData.fcgi', function (getres) {
		var contentType = getres.headers['content-type'];
	  
		getres.setEncoding('utf8');
		var rawData = '';
		getres.on('data', function (chunk) { rawData += chunk; });
		getres.on('end', function () {
		  try {
			var parsedData = JSON.parse(rawData);
			res.json(parsedData);
		  } catch (e) {
			console.error(e.message);
			res.json({ error: true, message: e.message });
		  }
		});
	  }).on('error', function (e) {
		res.json({ error: true });
	  });
});


var flushStats = schedule.scheduleJob('0,15,30,45 * * * *', function(){
	devices.flushStats();
});
var flushDailyStats = schedule.scheduleJob('1 0 * * *', function(){
	devices.flushDailyStats();
	Elmer.flushDailyStats();
});


// Start and initialize the node server on local host port
server.listen(9009,function(){
	console.log("HTTP Server ready.");
});
