var single;
var Elmer2 = function () {
	var data = { } ;
	var firstData = {};
	return {
		set: function (obj) {
			for (var attrname in obj) { data[attrname] = obj[attrname]; }
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
		}
	}
}

module.exports = function () {
	if (typeof single == 'undefined') {
		return single = new Elmer2();
	} else {
		return single;
	}
}