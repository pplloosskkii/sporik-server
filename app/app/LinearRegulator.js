
var single;
var DEBUG = require('./Debug');


var LinearRegulator = function () {
	var data = {};
	var elmerValues;
	var lastValues;

	var deviceData;
	var DEVICE_START_COEFICIENT;


	function powerDown(device, powerAvailable) {
	//	deviceData = device.get();
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 4));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation >= deviceData.max_regulation) newRegulation = deviceData.max_regulation; 
		if (newRegulation < 0) return powerDown(device, powerAvailable / 2)
		DEBUG.log('--- reg:', deviceData.regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.updateSingle({'regulation': newRegulation }, true); // force
	}

	function powerUp(device, powerAvailable) {
	//	deviceData = device.get();
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 4));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation >= deviceData.max_regulation) newRegulation = deviceData.max_regulation;
		if (newRegulation < 0)  return powerUp(device, powerAvailable / 2);
		// console.log("NEWREG", newRegulation, "MAXREG", deviceData.max_regulation)
		DEBUG.log('+++ reg:', deviceData.regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.updateSingle({'regulation': newRegulation }, true); // force publish message
	}


	function regulate(device) {
		deviceData = device.get();

		if (deviceData.phase < 1 || deviceData.phase > 3) {
			return;
		}

		var	phaseValue = (elmerValues['P' + deviceData.phase + 'A+'] / 10) || 0;

		var powerAvailable = Math.round(deviceData.autorun_max - phaseValue);
		var overflow = elmerValues.overflow[deviceData.phase - 1];

		//deviceData.phase == 1 && DEBUG.log('Power avail:', powerAvailable, 'overflow:', elmerValues['overflow'], 'reg:', deviceData.regulation);

		if (overflow > 0 && powerAvailable < 0) {
			powerAvailable = Math.abs(powerAvailable);
			DEBUG.log('Inverting power avail:', powerAvailable);
		}

		DEVICE_START_COEFICIENT = Math.round(deviceData.max_consumption / 100);

		if (powerAvailable < (1.1 * DEVICE_START_COEFICIENT) && powerAvailable > (-1.1 * DEVICE_START_COEFICIENT)) return;
		if (powerAvailable > 0) {
			// we have power to add
			powerUp(device, powerAvailable);
		} else {
			// decrease regulation
			powerDown(device, powerAvailable);
		}
		lastValues = phaseValue;
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
		return single = new LinearRegulator();
	} else {
		return single;
	}
}
