var single;



var DeviceRegulator = function () {
	var START_ON_COEFICIENT = 200; // WATTS before fully start device
	var data = {};
	var watchedPhaseValue = 0;
	var elmerValues = [];

	function lowerConsumption(device, regulation, coef) {
		var newRegulation = parseInt(regulation) - parseInt(coef);
		if (newRegulation > 100) return;
		//console.log('--- reg:', regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.update({'regulation': newRegulation }, true); // force
	}

	function higherConsumption(device, regulation, coef) {
		var newRegulation = parseInt(regulation) + parseInt(coef);
		if (newRegulation < 0) return;
		//console.log('+++ reg:', regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.update({'regulation': newRegulation }, true); // force publish message
	}


	function regulate(device) {
		var deviceData = device.get();
		var powerAvailable = Math.round(deviceData.autorun_max - watchedPhaseValue);
		if (powerAvailable < 20 && powerAvailable > -20) return;
		if (powerAvailable > 0) {
			// we have power to add
			higherConsumption(device, deviceData.regulation, 1);
		} else {
			// decrease regulation
			lowerConsumption(device, deviceData.regulation, 1);
		}
	}


	return {
		tick: function(Elmer, deviceList) {
			var elmer = Elmer.get();
			var devices = deviceList.list(); // devices = instanceof DictionaryJs
			if (devices.size() == 0) {
				//console.log('will NOT regulate: no devices');
				return false;
			}

			watchedPhaseValue = (elmer['P3A+'] / 10) || 0;

			// regulate all devices
			// TODO by priority
			devices.forEach(function(key, device) {
				if (device.isRegulable()) {
					regulate(device);
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