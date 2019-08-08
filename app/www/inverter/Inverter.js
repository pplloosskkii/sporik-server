

sporikApp.factory('Inverter', ['$http', '$q', '$timeout', 'AppConfig', function ($http, $q, $timeout, AppConfig) {
	return {

		data: { ok: false },

		get: function () {
			var deferred = $q.defer();
			$http.get(AppConfig.inverterUrl, { timeout: 3000 }).then(function(data, status, headers, config) {
				this.data = data;
				this.data.ok = true;
				deferred.resolve(data);
			}.bind(this), deferred.reject);
			return deferred.promise;
		},

		getValues: function () {
			return this.data;
		},

		process: function (callback) {
			this.get().then(function (data) {
				callback(data);
			}.bind(this));
		}
	};
}]);