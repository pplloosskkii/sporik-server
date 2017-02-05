sporikApp.directive('device', ['$timeout', 'Devices', function($timeout, Devices) {
	return {
		restrict: 'A',
		scope: {
			device: '='
		},
		templateUrl: './app/www/device/device.html',
		link: function(scope, element, attrs) {
			scope.autorun = { 
				maximum: scope.device.autorun_max || 0,
				enabled: false,
				showModal: false,
			}
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
				if (!scope.isAutorun() && (scope.autorun.enabled == false || scope.autorun.showModal)) {
					scope.autorun.showModal = true;
					return;
				} 
				toggle();
			}

			var toggle = function () {
				if (scope.device.autorun == true) {
					scope.device.autorun = 0;
				} else {
					scope.device.autorun = 1;
				}
				Devices.setAutorun(scope.device.address, scope.device.autorun, scope.autorun.maximum).then(function (data) {
					scope.autorun.enabled = false;
				});
			}

			scope.setRegulationMax = function() {
				scope.autorun.showModal = false;
				scope.autorun.enabled = true;
				toggle();
			}

			scope.isAutorun = function () {
				return (scope.device.autorun + 0) == 1;
			}
		}
	}
}]);