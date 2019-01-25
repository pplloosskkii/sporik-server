var single;
var DEBUG = require('./Debug');


var RelayRegulator = function () {
	var elmerValues;
	var deviceData;
	var lastValues;
	var ticks = 0;


	function regulate(device) {
		deviceData = device.get();

		if (deviceData.phase < 1 || deviceData.phase > 3) {
			return;
		}

		var	phaseValue = (elmerValues['P' + deviceData.phase + 'A+'] / 10) || 0;
		var overflow = elmerValues['overflow'][deviceData.phase - 1];
		var regulationStart = deviceData.autorun_max;
		var currentRegulation = deviceData.regulation / 100;

		var outputState = 0; // default is off
		console.log(overflow);
		console.log(regulationStart);
		console.log(phaseValue);
		console.log("---------");
		if (!overflow && regulationStart < 0 && phaseValue < (-1 * regulationStart)) {
			// should start because it is overflowing and measured value is greater
			// than DB-set value
			outputState = 1;
			ticks = 0;
		}

		if (overflow > 0 && regulationStart > 0 && phaseValue > regulationStart) {
			// should start because it is overflowing and measured value is greater
			// than DB-set value
			outputState = 1;
			ticks = 0;
		}

		if (currentRegulation == 1 && ticks >= 0 && ticks < 5) {
			// should keep running for at least couple of ticks
			outputState = 1;
		}

		if (outputState != currentRegulation) {
			device.updateSingle({'regulation': outputState * 100 }, true); // publish message
			lastValues = phaseValue;
		}
		ticks++;
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