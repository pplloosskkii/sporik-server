var DeviceDb = require('./DeviceDb')();
var mqttWrapper = require("./MqttWrapper")();
var DEBUG = require('./Debug');

var ERROR_CODES = [
	'OK',
	'BOOT',
	'ZX_TIMEOUT',
	'OTHER'
];

var Device = function (param) {  
	var obj = {
		address: null, 
		autorun: 0, 
		autorun_max: 0, 
		measurement: null, 
		measurement_changed_at: null,
		regulation: null,
		regulation_changed_at: null,
		is_registered: 0,
		max_consumption: null,
		phase: null,
		alias: null,
		description: null,
		is_linear:null,
		priority: null,
		max_regulation:null, // 0 - 100 % int
	};
	var is_regulating = false;
	var error = null;
	
	var measurements = {
		regulation: 0,
		voltage: 0,
		current: 0,
		temperature: 0,
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
		obj.address = param;
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
			newObj.regulation = parseInt(newObj.regulation);

			if (newObj.address.indexOf('nabijecka') > -1) {
				newObj.deviceType = 'charger';
			} else {
				newObj.deviceType = 'sporik';
			}
			newObj.measurement_recount = this.recount(obj.max_consumption, obj.regulation);

			newObj.measurements = measurements;
			newObj.stats = { short: shortStats, long: stats };
			newObj.is_regulating = is_regulating;
			if (this.hasError()) {
				newObj.error = error;
			}
			if (this.isAlive()) {
				newObj.alive = true;
			} else {
				newObj.alive = false;
			}
			return newObj;
		},
		recount: function (max_consumption, regulation) {
			return Math.max(0, (max_consumption / 100) * regulation);
		},
		update: function (newData) {
			for (var i in {'autorun':0, 'autorun_max':0, 'phase':0, 'alias':0, 'description':0, 'is_linear':0, 'max_consumption':0, 'priority': 0, 'max_regulation': 0}) {
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
			var isAlive = (new Date().valueOf() - obj.measurement_changed_at) < 30000;
			DEBUG.log("isAlive:", isAlive, " changed at: ", new Date().valueOf(), " - ", obj.measurement_changed_at);
			return isAlive; // older than 30s are dead
		},
		isRegulable: function () {
			return (obj.autorun == true && Number.isInteger(obj.autorun_max));
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
		setActiveState: function (activeState) {
			is_regulating = activeState;
		},
		setError: function (errorCode) {
			error = {
				code: errorCode,
				type: ERROR_CODES[errorCode]
			};
			setTimeout(function () { 
				error = null;
			}, 30000);
		},
		hasError: function () {
			return (error === null ? false : true);
		},
		// 1 kWh = 3 600 000 Ws
		recountEnergy: function () {
			stats.wattsTotal += this.get().measurement_recount;
			stats.hits++;
			//console.log(stats.wattsTotal, stats.kWh, shortStats.kWh);
			if (stats.wattsTotal > 36000) { // 0.01 kWh 
				stats.wattsTotal = 0;
				stats.hits = 0;
				stats.kWh = stats.kWh + 0.01; // increment
				shortStats.kWh = shortStats.kWh + 0.01; // increment
			}
		},
		resetShortStats: function () {
			shortStats.kWh = 0;
		},
		resetDailyStats: function () {
			stats = { wattsTotal: 0, hits: 0, kWh: 0 };
		},
		setMeasurement: function (measurementData) {
			if (measurementData.volts && measurementData.amps && measurementData.temp) {
				var tmpMeasure = {
					'regulation': parseInt(measurementData.r),
					'voltage': parseFloat(measurementData.volts),
					'current': parseFloat(measurementData.amps),
					'temperature': parseInt(measurementData.temp),
				};
				measurements = tmpMeasure;
			}
		}

	}
};

module.exports = Device;