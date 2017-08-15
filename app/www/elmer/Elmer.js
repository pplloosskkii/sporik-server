

sporikApp.factory('Elmer', ['$http', '$q', '$timeout', 'AppConfig', function ($http, $q, $timeout, AppConfig) {
	return {
		get: function () {
			var deferred = $q.defer();
			$http.get(AppConfig.apiUrl + '/elmer').then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, deferred.reject);
			return deferred.promise;
		},
	};
}]);