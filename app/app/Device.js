var DeviceDb = require('./DeviceDb')();
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.99');

var DEBUG = false;


var Device = function (param) {  
	var obj = {
		address: null, 
		autorun: null, 
		autorun_max: null, 
		measurement: null, 
		measurement_changed_at: null,
		regulation: null,
		regulation_changed_at: null,
		is_registered: false,
		max_consumption: null,
		phase: null,
		alias: null,
		description: null,
	};

	if ((typeof param).toLowerCase() === 'string') {
		// param is address
		obj.address = address;
	} else if ((typeof param).toLowerCase() === 'object') {
		// param is full object from db 
		obj = param;
	}

	return {
		getParam: function(prop) {
			if (obj.hasOwnProperty(prop)) {
				return obj[prop];
			}
		},
		get: function() {
			obj.measurement_recount = Math.max(0, (obj.max_consumption / 100) * obj.regulation);
			return obj;
		},
		update: function (param, publish) {
			var publish = publish || false;
			var timestamp = new Date().valueOf();
			for (var i in param) {
				obj[i] = param[i];
				obj[i + '_changed_at'] = timestamp;
				param[i + '_changed_at'] = timestamp;
			}
			DeviceDb.device.update(obj.address, param);

			if (publish && typeof param['regulation'] !== 'undefined') {
				client.publish('sporik/regulate', '{"address": "' + obj.address + '", "value": ' + param['regulation'] + '}');
			}
		},
		isAlive: function () {
			return (new Date().valueOf()) - obj.measurement_changed_at < 30000; // older than 30s are dead
		},
		isRegulable: function () {
			return (obj.autorun == true && obj.autorun_max > 0);
		},
		setRegulationMode: function (mode, maximum) {
			obj['autorun'] = mode;
			obj['autorun_max'] = maximum;
			DeviceDb.device.update(obj.address, { 'autorun': mode, 'autorun_max': maximum });
		}
	}
};

module.exports = Device;