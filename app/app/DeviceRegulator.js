var LinearRegulator = require('./LinearRegulator')();
var RelayRegulator = require('./RelayRegulator')();
var ZeroRegulator = require('./ZeroRegulator')();

var DEBUG = require('./Debug');
var single;

var DeviceRegulator = function () {
	var data = {};

	return {
		tick: function(Elmer, deviceList) {
			var devices = deviceList.list(); // devices = instanceof DictionaryJs
			var elmer = Elmer.get();

			if (devices.size() == 0) {
				DEBUG.log('will NOT regulate: no devices');
				return false;
			}

			// regulate all devices (order by priority, zero is highest priority)
			var deviceList = [];
			devices.forEach(function(key, device) {
				deviceList.push(device);
			});
			deviceList.sort(function (a, b) {
				if (a.priority >= 0 && b.priority >= 0 && a.priority < b.priority) return -1;
				if (a.priority >= 0 && b.priority >= 0 && a.priority > b.priority) return 1;
				return 0;
			})

			deviceList.forEach(function(device) {
				DEBUG.log("ALIAS:", device.get().address, " PRIO:", device.get().priority);	
				device.recountEnergy();

				if (!device.isRegulable()) return;
			
				if (device.isLinear()) {
					if (device.get().autorun_max == 0)
						regulator = ZeroRegulator;
					else
						regulator = LinearRegulator;
				} else {
					regulator = RelayRegulator;
				}
				regulator.setElmer(elmer);
				regulator.regulate(device);
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