var DeviceDb = require('./DeviceDb')();
var mqttWrapper = require("./MqttWrapper")();
var DEBUG = require('./Debug');

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
		priority: null,
	};

	var stats = {
		wattsTotal: 0,
		hits: 0,
		kWh: 0
	};

	var shortStats = {
		kWh: 0
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
			newObj.measurement_recount = this.recount(obj.max_consumption, obj.regulation);
			newObj.stats = { short: shortStats, long: stats }
			return newObj;
		},
		recount: function (max_consumption, regulation) {
			return Math.max(0, (max_consumption / 100) * regulation);
		},
		update: function (newData) {
			for (var i in {'autorun':0, 'autorun_max':0, 'phase':0, 'alias':0, 'description':0, 'is_linear':0, 'max_consumption':0, 'priority': 0}) {
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
				mqttWrapper.publish('sporik/regulate', '{"address":"' + obj.address + '","value":' + param['regulation'] + '}');
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
		},

		// 1 kWh = 3 600 000 Ws
		recountEnergy: function () {
			stats.wattsTotal += this.get().measurement_recount;
			stats.hits++;
			if (stats.wattsTotal > 36000) { // 0.01 kWh 
				stats.wattsTotal = 0;
				stats.hits = 0;
				stats.kWh = Math.round(stats.kWh, 2) + 0.01; // increment
				shortStats.kWh = Math.round(shortStats.kWh, 2) + 0.01; // increment
			}
		},
		resetShortStats: function () {
			shortStats.kWh = 0;
		}

	}
};

module.exports = Device;