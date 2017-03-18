
var single;
var DEBUG = false;


var LinearRegulator = function () {
	var data = {};
	var elmerValues;
	var lastValues;
	var lastRegulationDirection;

	var deviceData;
	var DEVICE_START_COEFICIENT;

	function lowerConsumption(device, powerAvailable) {
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 2));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation > 100 || newRegulation < 0) return lowerConsumption(device, powerAvailable / 2)
		lastRegulationDirection = 'down';
		DEBUG && console.log('--- reg:', deviceData.regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.update({'regulation': newRegulation }, true); // force
	}

	function higherConsumption(device, powerAvailable) {
		var coef = Math.round(powerAvailable / (DEVICE_START_COEFICIENT * 2));
		var newRegulation = parseInt(deviceData.regulation) + coef;
		if (newRegulation > 100 || newRegulation < 0)  return higherConsumption(device, powerAvailable / 2)
		lastRegulationDirection = 'up';
		DEBUG && console.log('+++ reg:', deviceData.regulation, 'coef:', coef, 'newreg:', newRegulation);
		device.update({'regulation': newRegulation }, true); // force publish message
	}


	function regulate(device) {
		deviceData = device.get();

		if (deviceData.phase < 1 || deviceData.phase > 3) {
			return;
		}

		var	phaseValue = (elmerValues['P' + deviceData.phase + 'A+'] / 10) || 0;

		var powerAvailable = Math.round(deviceData.autorun_max - phaseValue);
		DEBUG && console.log('Power avail:', powerAvailable, 'overflow:', elmerValues['overflow']);

		if (elmerValues['overflow'][deviceData.phase - 1] > 0 && powerAvailable < 0) {
			powerAvailable = -1*powerAvailable;
			DEBUG && console.log('Inverting power avail:', powerAvailable);
		}

		// pokud je aktualni hodnota vyssi nez predtim (aka vyssi spotreba),
		// a zaroven se i regulovalo nahoru
		/*if (phaseValue > lastValues && lastRegulationDirection == 'up') {
			powerAvailable = -1 * powerAvailable;
			DEBUG && console.log('inverting power');
		}*/

		DEVICE_START_COEFICIENT = Math.round(deviceData.max_consumption / 100);

		if (powerAvailable < (1.1 * DEVICE_START_COEFICIENT) && powerAvailable > (-1.1 * DEVICE_START_COEFICIENT)) return;
		if (powerAvailable > 0) {
			// we have power to add
			higherConsumption(device, powerAvailable);
		} else {
			// decrease regulation
			lowerConsumption(device, powerAvailable);
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