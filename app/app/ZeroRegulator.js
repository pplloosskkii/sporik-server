var single;
var DEBUG = require('./Debug');


var ZeroRegulator = function () {
	var data = {};
	var elmerValues;
	var lastValues;
	var lastOverflow;
	var lastRegulationDirection;

	var deviceData;
	var DEVICE_START_COEFICIENT;

	function lowerConsumption(device, powerAvailable) {
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 2));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation > 100) newRegulation = 100;
		if (newRegulation < 0) {
			return lowerConsumption(device, powerAvailable / 2)
		}
		lastRegulationDirection = 'down';
		device.phase == 2 && DEBUG.log('--- reg:', deviceData.regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.updateSingle({'regulation': newRegulation }, true); // force
	}

	function higherConsumption(device, powerAvailable) {
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 2));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation > 100) newRegulation = 100;
		if (newRegulation < 0)  return higherConsumption(device, powerAvailable / 2)
		lastRegulationDirection = 'up';
		device.phase == 2 && DEBUG.log('+++ reg:', deviceData.regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.updateSingle({'regulation': newRegulation }, true); // force publish message
	}


	function regulate(device) {
		// obtain device data
		deviceData = device.get();

		// check valid phase 
		if (deviceData.phase < 1 || deviceData.phase > 3) {
			return;
		}

		// get measurement of phase the device is on
		var	phaseValue = (elmerValues['P' + deviceData.phase + 'A+'] / 10) || 0;
		var overflow = elmerValues['overflow'][deviceData.phase - 1];

		// autorun_max is the value we want to keep regulation on
		if (deviceData.autorun_max != 0) {
			console.log('Error: non zero value for ZeroRegulator');
			return;
		}

		DEVICE_START_COEFICIENT = Math.round(deviceData.max_consumption / 100);	
		deviceData.phase == 2 && DEBUG.log('ZeroRegulator Measured:', phaseValue, 'overflow:', overflow);

		if (phaseValue == 0 && overflow == 0) return;
		if (phaseValue > 0) {				
			if (overflow > 0 || (phaseValue < 200 && lastOverflow > 0)) {
				// we have power to add
				higherConsumption(device, phaseValue + (overflow * 100));
			} else {
				// decrease regulation
				if (phaseValue < 50) phaseValue = phaseValue / 2;
				lowerConsumption(device, -1 * phaseValue);
			}
		}
		lastValues = phaseValue;
		lastOverflow = overflow;
	}


	return {
		regulate: regulate,
		setElmer: function (elmerData) {
			elmerValues = elmerData;
		}
	};
}

module.exports = function () {
	if (typeof single == 'undefined') {
		return single = new ZeroRegulator();
	} else {
		return single;
	}
}
