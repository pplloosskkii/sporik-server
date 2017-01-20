var single;
var Elmer = function () {
	var data = {};
	return {
		set: function (obj) {
			data = obj;
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