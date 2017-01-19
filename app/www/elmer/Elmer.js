

sporikApp.factory('Elmer', ['$http', '$q', '$timeout', 'ApiConfig', function ($http, $q, $timeout, ApiConfig) {
	return {
		get: function () {
			var deferred = $q.defer();
			$http.get(ApiConfig.url + '/elmer').then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},
	};
}]);