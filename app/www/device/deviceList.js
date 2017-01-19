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
  				$timeout(fetchDevices, 5000);
  			});
    	}

    	fetchDevices();
	},

  }
}]);