var DeviceDb = require('./DeviceDb')();

var DEBUG = false;


var Device = function (param) {  
	var obj = {
		address: null, 
		state: null, 
		state_changed_at: null,
		measurement: null, 
		measurement_changed_at: null,
		regulation: null,
		regulation_changed_at: null,
		is_registered: false,
		max_consumption: null,
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
			return obj;
		},
		update: function (param) {
			var timestamp = new Date().valueOf();
			for (var i in param) {
				obj[i] = param[i];
				obj[i + '_changed_at'] = timestamp;
				param[i + '_changed_at'] = timestamp;
			}
			DeviceDb.device.update(obj.address, param);
		},
		isAlive: function () {
			return (new Date().valueOf()) - obj.measurement_changed_at < 30000; // older than 30s are dead
		},
	}
};

module.exports = Device;