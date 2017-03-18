var LinearRegulator = require('./LinearRegulator')();
var RelayRegulator = require('./RelayRegulator')();

var single;
var DEBUG = false;


var DeviceRegulator = function () {
	var data = {};

	return {
		tick: function(Elmer, deviceList) {
			var devices = deviceList.list(); // devices = instanceof DictionaryJs
			if (devices.size() == 0) {
				//console.log('will NOT regulate: no devices');
				return false;
			}

			// regulate all devices
			// TODO by priority
			devices.forEach(function(key, device) {
				if (device.isRegulable()) {
					if (device.isLinear()) {
						regulator = LinearRegulator;
					} else {
						regulator = RelayRegulator;
					}
					regulator.setElmer(Elmer.get());
					regulator.regulate(device);
				}
			});
		}
	}
}

module.exports = function () {
	if (typeof single == 'undefined') {
		return single = new DeviceRegulator();
	} else {
		return single;
	}
}