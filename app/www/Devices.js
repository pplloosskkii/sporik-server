sporikApp.factory('Devices', ['$http', '$q', '$timeout', 'ApiConfig', function ($http, $q, $timeout, ApiConfig) {
	return {
		list: function () {
			var deferred = $q.defer();
			$http.get(ApiConfig.url + '/list').then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		get: function (address) {
			var deferred = $q.defer();
			$http.get(ApiConfig.url + '/get/' + address).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		setAutorun: function (address, autorun_value, autorun_maximum) {
			var deferred = $q.defer();
			$http.put(ApiConfig.url + '/autorun/' + address + "/" + (autorun_value + 0) + "/" + autorun_maximum).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},

		regulate: function (address, amount) {
			var deferred = $q.defer();
			$http.put(ApiConfig.url + '/regulate/' + address + '/' + amount).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},
	};
}]);
