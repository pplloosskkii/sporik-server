sporikApp.factory('Devices', ['$http', '$q', '$timeout', 'AppConfig', function ($http, $q, $timeout, AppConfig) {
	return {
		list: function () {
			var deferred = $q.defer();
			$http.get(AppConfig.apiUrl + '/list').then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		get: function (address) {
			var deferred = $q.defer();
			$http.get(AppConfig.apiUrl + '/get/' + address).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		save: function (device) {
			var deferred = $q.defer();
			$http.post(AppConfig.apiUrl + '/update/' + device.address, device).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		setAutorun: function (address, autorun_value, autorun_maximum) {
			var deferred = $q.defer();
			$http.put(AppConfig.apiUrl + '/autorun/' + address + "/" + (autorun_value + 0) + "/" + autorun_maximum).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		regulate: function (address, amount) {
			var deferred = $q.defer();
			$http.put(AppConfig.apiUrl + '/regulate/' + address + '/' + amount).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},
	};
}]);
