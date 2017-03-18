var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require("body-parser");
var client = require("./app/app/MqttClient");
var devices = require("./app/app/DeviceList")(client);
var Elmer = require('./app/app/Elmer')();
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

app.get('/api/list',function(req, res){
	ret = [];
	devices.list().forEach(function(key, device) {
		//console.log(device.toString());
		if (device.isAlive() || !device.isRegistered()) {
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


app.put('/api/autorun/:id/:value/:maximum',function(req,res){
	var ret = devices.list().get(req.params.id);
	if (typeof ret == 'undefined') {
		return res.status(404).json({ ok: false, reason: "404 Not Found" });
	}
	ret.setRegulationMode(parseInt(req.params.value), parseInt(req.params.maximum));
	res.json({"ok":true});
});


app.get('/api/elmer',function(req,res){
	res.json(Elmer.get());
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
