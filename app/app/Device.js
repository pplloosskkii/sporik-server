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
		is_linear:null,
	};

	if ((typeof param).toLowerCase() === 'string') {
		// param is address
		obj.address = address;
		obj.autorun = 0;
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
			var newObj = {};
			for (var i in obj) {
				newObj[i] = obj[i];
			}
			newObj.measurement_recount = Math.max(0, (obj.max_consumption / 100) * obj.regulation);
			return newObj;
		},
		update: function (newData) {
			for (var i in {'autorun':0, 'autorun_max':0, 'phase':0, 'alias':0, 'description':0, 'is_linear':0, 'max_consumption':0}) {
				obj[i] = newData[i];
			}
			DeviceDb.device.update(obj.address, obj);
		},
		updateSingle: function (param, publish) {
			var publish = publish || false;
			var timestamp = new Date().valueOf();
			for (var i in param) {
				obj[i] = param[i];
				obj[i + '_changed_at'] = timestamp;
				param[i + '_changed_at'] = timestamp;
			}
			DeviceDb.device.update(obj.address, param);

			if (publish && typeof param['regulation'] !== 'undefined') {
				client.publish('sporik/regulate', '{"address":"' + obj.address + '","value":' + param['regulation'] + '}');
			}
		},
		isAlive: function () {
			return (new Date().valueOf()) - obj.measurement_changed_at < 30000; // older than 30s are dead
		},
		isRegulable: function () {
			return (obj.autorun == true && obj.autorun_max >= 0);
		},
		isLinear: function () {
			return (obj.is_linear == true);
		},
		setRegulationMode: function (mode, maximum) {
			obj.autorun = mode;
			obj.autorun_max = maximum;
			DeviceDb.device.update(obj.address, { 'autorun': mode, 'autorun_max': maximum });
		},
		toString: function () {
			return "Device: " + obj.address + " (" + obj.alias + ") - " + obj.description;
		}
	}
};

module.exports = Device;