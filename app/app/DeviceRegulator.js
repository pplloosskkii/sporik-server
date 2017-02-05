var single;



var DeviceRegulator = function () {
	var data = {};
	var elmerValues;
	var deviceData;
	var DEVICE_START_COEFICIENT;

	function lowerConsumption(device, powerAvailable) {
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 2));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation > 100) return;
		//console.log('--- reg:', regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.update({'regulation': newRegulation }, true); // force
	}

	function higherConsumption(device, powerAvailable) {
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 2));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation < 0) return;
		//console.log('+++ reg:', regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.update({'regulation': newRegulation }, true); // force publish message
	}


	function regulate(device) {
		deviceData = device.get();

		if (deviceData.phase < 1 || deviceData.phase > 3) {
			return;
		}

		var	phaseValue = (elmerValues['P' + deviceData.phase + 'A+'] / 10) || 0;
		var powerAvailable = Math.round(deviceData.autorun_max - phaseValue);
		DEVICE_START_COEFICIENT = Math.round(deviceData.max_consumption / 100);

		if (powerAvailable < (1.1 * DEVICE_START_COEFICIENT) && powerAvailable > (-1.1 * DEVICE_START_COEFICIENT)) return;
		if (powerAvailable > 0) {
			// we have power to add
			higherConsumption(device, powerAvailable);
		} else {
			// decrease regulation
			lowerConsumption(device, powerAvailable);
		}
	}


	return {
		tick: function(Elmer, deviceList) {
			elmerValues = Elmer.get();
			var devices = deviceList.list(); // devices = instanceof DictionaryJs
			if (devices.size() == 0) {
				//console.log('will NOT regulate: no devices');
				return false;
			}

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