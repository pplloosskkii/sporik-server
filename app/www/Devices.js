sporikApp.factory('Devices', ['$http', '$q', '$timeout', 'AppConfig', function ($http, $q, $timeout, AppConfig) {
	return {
		list: function () {
			var deferred = $q.defer();
			$http.get(AppConfig.apiUrl + '/devices').then(function(data, status, headers, config) {
				data.data.devices.sort(function (a,b) {
					if (a.priority >= 0 && b.priority >= 0 && a.priority < b.priority) return -1;
					if (a.priority >= 0 && b.priority >= 0 && a.priority > b.priority) return 1;
					return 0;
				})
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		get: function (address) {
			var deferred = $q.defer();
			$http.get(AppConfig.apiUrl + '/devices/' + address).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		save: function (device) {
			var deferred = $q.defer();
			$http.post(AppConfig.apiUrl + '/devices/' + device.address, device).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		setAutorun: function (address, autorun_value, autorun_maximum) {
			var deferred = $q.defer();
			$http.put(AppConfig.apiUrl + '/devices/' + address + "/autorun/" + (autorun_value + 0) + "/" + autorun_maximum).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		regulate: function (address, amount) {
			var deferred = $q.defer();
			$http.put(AppConfig.apiUrl + '/devices/' + address + '/regulate/' + amount).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		fetchStats: function (address) {
			var deferred = $q.defer();
			$http.get(AppConfig.apiUrl + '/devices/' + address + '/stats').then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

	};
}]);
