var single;
var DEBUG = require('./Debug');


var ZeroRegulator = function () {
	var data = {};
	var elmerValues;

	var deviceData;
	var DEVICE_START_COEFICIENT;
	var lastOverflow;
	var lastRegulation = [];

	function powerDown(device, powerAvailable) {
		// deviceData = device.get();
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 2));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation >= deviceData.max_regulation) newRegulation = deviceData.max_regulation;
		if (newRegulation < 0) {
			return powerDown(device, powerAvailable / 2)
		}
		//device.phase == 2 && DEBUG.log('--- reg:', deviceData.regulation, 'coef:', coef, 'newreg:', newRegulation);
		if (lastRegulation[device] != newRegulation) {
			device.updateSingle({'regulation': newRegulation }, true); // force
			lastRegulation[device] = newRegulation;
		}
	}

	function powerUp(device, powerAvailable) {
		// deviceData = device.get();
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 2));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation > deviceData.max_regulation) {
			if (newRegulation > deviceData.max_regulation + 2) {
				newRegulation = deviceData.max_regulation;
			} else return powerUp(device, powerAvailable / 2);
			//
		}
		if (newRegulation < 0)  return powerUp(device, powerAvailable / 2)
		//device.phase == 2 && DEBUG.log('+++ reg:', deviceData.regulation, 'coef:', coef, 'newreg:', newRegulation);
		if (lastRegulation[device] != newRegulation) {
			device.updateSingle({'regulation': newRegulation }, true); // force
			lastRegulation[device] = newRegulation;
		}
	}


	function regulate(device) {
		// obtain device data
		deviceData = device.get();

		// check valid phase 
		if (deviceData.phase < 1 || deviceData.phase > 3) {
			return;
		}

		// get measurement of phase the device is on (in Watts)
		var	elmerPhaseReading = (elmerValues['P' + deviceData.phase + 'A+'] / 10) || 0;
		var elmerPhaseOverflow = elmerValues['overflow'][deviceData.phase - 1];

		// autorun_max is the value we want to keep regulation on
		if (deviceData.autorun_max != 0) {
			console.log('Error: non zero value for ZeroRegulator');
			return;
		}

		DEVICE_START_COEFICIENT = Math.round(deviceData.max_consumption / 100);	

		if (elmerPhaseReading == 0 && elmerPhaseOverflow == 0) {
			return; // great, nothing more to do
		}

		// if there is some consumption or power available
		if (elmerPhaseReading > 0) {
			
			// power available
			if (elmerPhaseOverflow > 0 || (elmerPhaseReading < 200 && lastOverflow > 0)) {
				powerUp(device, elmerPhaseReading + (elmerPhaseOverflow * 100));
			} else { // decrease regulation
				if (elmerPhaseReading < 50) elmerPhaseReading = elmerPhaseReading / 2;
				powerDown(device, -1 * elmerPhaseReading);
			}
		}
		lastOverflow = elmerPhaseOverflow;
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
