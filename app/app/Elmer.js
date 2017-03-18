var single;
var Elmer = function () {
	var data = { overflow : [0,0,0] } ;
	var tmpData = { overflowData: [0,0,0] };
	return {
		set: function (obj) {
			for (var attrname in obj) { data[attrname] = obj[attrname]; }
			data.overflow = [ obj['P1S-'] - tmpData.overflowData[0], obj['P2S-'] - tmpData.overflowData[1], obj['P3S-'] - tmpData.overflowData[2] ];
			tmpData.overflowData = [ obj['P1S-'], obj['P2S-'], obj['P3S-']];
		},
		get: function() {
			return data;
		}
	}
}

module.exports = function () {
	if (typeof single == 'undefined') {
		return single = new Elmer();
	} else {
		return single;
	}
}