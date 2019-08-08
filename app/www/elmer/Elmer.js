

sporikApp.factory('Elmer', ['$http', '$q', '$timeout', 'AppConfig', function ($http, $q, $timeout, AppConfig) {
	return {

		data: { ok: false },

		get: function () {
			var deferred = $q.defer();
			$http.get(AppConfig.apiUrl + '/elmer', { timeout: 3000 }).then(function(data, status, headers, config) {
				this.data.ok = true;
				deferred.resolve(data);
			}.bind(this), deferred.reject);
			return deferred.promise;
		},

		setValues: function (data, obj, callback) {	
			obj.data.o1 = data.data['overflow'][0] || 0;
			obj.data.o2 = data.data['overflow'][1] || 0;
			obj.data.o3 = data.data['overflow'][2] || 0;

			obj.data.tp1 = data.data['P1S-'];
			obj.data.tp2 = data.data['P2S-'];
			obj.data.tp3 = data.data['P3S-'];

			obj.data.tc1 = data.data['P1S+'];
			obj.data.tc2 = data.data['P2S+'];
			obj.data.tc3 = data.data['P3S+'];

			obj.data.p1 = Math.round((obj.data.o1 > 0 ? '+' : '-') + "" + (data.data['P1A+'] / 10));
			obj.data.p2 = Math.round((obj.data.o2 > 0 ? '+' : '-') + "" + (data.data['P2A+'] / 10));
			obj.data.p3 = Math.round((obj.data.o3 > 0 ? '+' : '-') + "" + (data.data['P3A+'] / 10));

			callback(obj.data);
		},

		getValues: function () {
			return this.data;
		},

		getDailyData: function () {
			var deferred = $q.defer();
			$http.get(AppConfig.apiUrl + '/elmer/stats', { timeout: 3000 }).then(function(data, status, headers, config) {
				deferred.resolve(data.data);
			}.bind(this), deferred.reject);
			return deferred.promise;
		},

		process: function (callback) {
			this.get().then(function (data) {
				this.setValues(data, this, callback);
			}.bind(this));
		}
	};
}]);