var DeviceDb = require('./DeviceDb')();

var single;
var Elmer = function () {
	var data = { overflow : [0,0,0] } ;
	var firstData = {};
	var tmpData = { overflowData: [0,0,0] };
	return {
		set: function (obj) {
			for (var attrname in obj) { data[attrname] = obj[attrname]; }
			data.overflow = [ obj['P1S-'] - tmpData.overflowData[0], obj['P2S-'] - tmpData.overflowData[1], obj['P3S-'] - tmpData.overflowData[2] ];
			tmpData.overflowData = [ obj['P1S-'], obj['P2S-'], obj['P3S-']];
		},
		setFirst: function () {
			firstData = JSON.parse(JSON.stringify(data)); // copy of data
		},
		get: function() {
			return data;
		},
		getFirst: function() {
			return firstData;
		},
		flushDailyStats: function () {
			DeviceDb.stats.insertElmerSum({ l1s: data['P1S+'], l2s: data['P2S+'], l3s: data['P3S+'], l1p: data['P1S-'], l2p: data['P2S-'], l3p: data['P3S-'] });
		},
	}
}

module.exports = function () {
	if (typeof single == 'undefined') {
		return single = new Elmer();
	} else {
		return single;
	}
}