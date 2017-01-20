sporikApp.directive('device', ['$timeout', 'Devices', function($timeout, Devices) {
	return {
		restrict: 'A',
		scope: {
			device: '='
		},
		templateUrl: './app/www/device/device.html',
		link: function(scope, element, attrs) {
			scope.device.regulation = scope.device.regulation || 1;
			scope.state = { isToggling: false, desiredToggle: scope.device.state };

			scope.$watch(scope.device, function (device) {
				if (device != null && typeof device != 'undefined' && device.state != scope.state.desiredToggle) {
					scope.state.isToggling = false;
				}
			});

			scope.device.regulate = function () {
				Devices.regulate(scope.device.address, scope.device.regulation).then(function (data) {
					console.log('regulated');
				});
			};
			scope.device.toggle = function () {
				Devices.toggle(scope.device.address).then(function (data) {
					console.log('toggled');
					scope.state.isToggling = true;
					scope.state.desiredToggle = scope.state;
				});
			}
			scope.device.isOn = function () {
				return (scope.device.state == 1);
			}
		}
	}
}]);