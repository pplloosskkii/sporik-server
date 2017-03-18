sporikApp.directive('deviceList', ['Devices', '$timeout', function(Devices, $timeout) {
  return {
    restrict: 'A',
    templateUrl: './app/www/device/deviceList.html',
    link: function(scope, element, attrs) {

    	var fetchDevices = function () {
        scope.loading = true;
    		Devices.list().then(function (data) {
  				scope.devices = data.data.devices;
          scope.loading = false;
  				$timeout(fetchDevices, 2500);
  			}, function (err) {
          // retry in 10s
          $timeout(fetchDevices, 10000);
        });
    	}

    	fetchDevices();
	},

  }
}]);