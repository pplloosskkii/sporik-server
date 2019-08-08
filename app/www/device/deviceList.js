sporikApp.directive('deviceList', ['Devices', '$timeout', '$rootScope', function(Devices, $timeout, $rootScope) {
  return {
    restrict: 'A',
    templateUrl: './app/www/device/deviceList.html',
    link: function(scope, element, attrs) {
      var timeout = null;
    	var fetchDevices = function () {
        scope.loading = true;
    		Devices.list().then(function (data) {
  				scope.devices = data.data.devices.sort(function(a, b){
            return a.phase > b.phase;
          });
          scope.loading = false;
  				timeout = $timeout(fetchDevices, 2500);
  			}, function (err) {
          // retry in 10s
          timeout = $timeout(fetchDevices, 10000);
        });
    	}

    	fetchDevices();

      $rootScope.$on('reloadDevices', function () {
          $timeout.cancel(timeout);
          fetchDevices();
      })
	},

  }
}]);