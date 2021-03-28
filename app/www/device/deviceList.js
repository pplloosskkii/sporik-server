sporikApp.directive('deviceList', ['Devices', '$timeout', '$rootScope', function(Devices, $timeout, $rootScope) {
  return {
    restrict: 'A',
    templateUrl: './app/www/device/deviceList.html',
    link: function(scope, element, attrs) {
      var timeout = null;
      scope.totalWattsSaved = 0;
      scope.totalWattsSavedBatteryIndicator = 0;

    	var fetchDevices = function () {
        scope.loading = true;

    		Devices.list().then(function (data) {
  				scope.devices = data.data.devices.sort(function(a, b){
            return a.phase > b.phase;
          });
          let totalWattsSaved = 0;
          scope.devices.forEach(device => {
            totalWattsSaved = totalWattsSaved + ((device.regulation / 100) * device.max_consumption);
          });
          scope.totalWattsSaved = totalWattsSaved;
          scope.totalWattsSavedBatteryIndicator = Math.round(totalWattsSaved / 1500);
          if (scope.totalWattsSavedBatteryIndicator > 4) scope.totalWattsSavedBatteryIndicator = 4

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