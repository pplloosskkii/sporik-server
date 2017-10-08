var single;
var DEBUG = require('./Debug');


var RelayRegulator = function () {
	var elmerValues;
	var deviceData;
	var lastValues;
	var ticks = 0;


	function regulate(device) {
		deviceData = device.get();
		ticks++;

		if (deviceData.phase < 1 || deviceData.phase > 3) {
			return;
		}

		var	phaseValue = (elmerValues['P' + deviceData.phase + 'A+'] / 10) || 0;
		var overflow = elmerValues['overflow'][deviceData.phase - 1];
		var regulationStart = deviceData.autorun_max;

		var outputState = 0; // default is off

		if (overflow > 0 && phaseValue > regulationStart) {
			// should start because it is overflowing and measured value is greater
			// than DB-set value
			outputState = 1;
		}

		device.updateSingle({'regulation': outputState * 100 }, true); // publish message
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
		return single = new RelayRegulator();
	} else {
		return single;
	}
}