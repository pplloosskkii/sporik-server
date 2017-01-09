
var sporikApp = angular.module('sporikApp', []);

sporikApp.factory('Devices', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
	var path = 'http://172.16.0.123:9000/api';
	return {
		list: function () {
			var deferred = $q.defer();
			$http.get(path + '/list').then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, function () { deferred.reject(); });
			return deferred.promise;
		},

		get: function (address) {
			var deferred = $q.defer();
			$http.get(path + '/get/' + address).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, function () { deferred.reject(); });
			return deferred.promise;
		},

		toggle: function (address) {
			var deferred = $q.defer();
			$http.put(path + '/toggle/' + address).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, function () { deferred.reject(); });
			return deferred.promise;
		},

		regulate: function (address, amount) {
			var deferred = $q.defer();
			$http.put(path + '/regulate/' + address + '/' + amount).then(function(data, status, headers, config) {
				deferred.resolve(data);
			}, function () { deferred.reject(); });
			return deferred.promise;
		},
	};
}]);



sporikApp.controller('sporikDashboard', ['Devices', '$timeout', function(Devices, $timeout) {
	scope = this;
	scope.dataValue = 1;


	load = function () {
		scope.loaded = false;
		scope.load(function () { scope.loaded = true; $timeout(load, 5000);});
		
	}

	scope.load = function (callback) {
		Devices.list().then(function (data) {
			scope.devices = data.data.devices;
			callback && callback();
		});
	}


	// for future use
	scope.get = function (address) {
		Devices.get(address).then(function (data) {
			//
		});
	}

	scope.toggle = function (address) {
		Devices.toggle(address).then(function (data) {
			console.log('toggled');
		});
	}

	scope.regulate = function (address, value) {
		Devices.regulate(address, value).then(function (data) {
			console.log('regulated');
		});
	}

	var showMoreItems = [];
	scope.showMore = function (address, write) {
		if (write === true) return showMoreItems.push(address);
		if (showMoreItems.indexOf(address) > -1) {
			return true;
		}
		return false;
	}

	load();

}]);
