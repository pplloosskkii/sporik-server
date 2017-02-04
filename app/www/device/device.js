sporikApp.directive('device', ['$timeout', 'Devices', function($timeout, Devices) {
	return {
		restrict: 'A',
		scope: {
			device: '='
		},
		templateUrl: './app/www/device/device.html',
		link: function(scope, element, attrs) {
			scope.device.regulation = scope.device.regulation || 0;

			scope.regulate = function () {
				Devices.regulate(scope.device.address, scope.device.regulation).then(function (data) {
					console.log('regulated');
				});
			};
			scope.isOn = function () {
				return (scope.device.regulation > 0);
			};
			scope.toggleAutorun = function () {
				if (scope.device.autorun == true) scope.device.autorun = 0;
				else scope.device.autorun = 1;
				Devices.setAutorun(scope.device.address, scope.device.autorun).then(function (data) {
				});
			}
			scope.isAutorun = function () {
				return (scope.device.autorun + 0) == 1;
			}
		}
	}
}]);