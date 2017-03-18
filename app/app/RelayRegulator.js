var single;
var DEBUG = false;


var RelayRegulator = function () {
	var elmerValues;
	var deviceData;
	var lastValues;


	function regulate(device) {
		deviceData = device.get();

		if (deviceData.phase < 1 || deviceData.phase > 3) {
			return;
		}

		var	phaseValue = (elmerValues['P' + deviceData.phase + 'A+'] / 10) || 0;

		var powerAvailable = Math.round(deviceData.autorun_max - phaseValue);
		DEBUG && console.log('Power avail:', powerAvailable, 'overflow:', elmerValues['overflow']);

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