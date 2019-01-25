sporikApp.directive('device', ['AppConfig', '$timeout', 'Devices', 'ModalService', function(AppConfig, $timeout, Devices, ModalService) {
	return {
		restrict: 'A',
		replace:false,
		scope: {
			device: '='
		},
		templateUrl: AppConfig.templates.device,
		link: function(scope, element, attrs) {
			scope.device.regulation = scope.device.regulation || 0;
			scope.loading = { 
				'toggleOnOff': false,
				'toggleAutorun': false,
			};
			var settingsScope = scope.$new();

			scope.regulate = function () {
				Devices.regulate(scope.device.address, scope.device.regulation).then(function (data) {
				});
			};
			scope.isOn = function () {
				return (scope.device.regulation > 0);
			};

			scope.setAutorun = function (autorun_value) {
				scope.device.autorun = (autorun_value !== false ? 1 : 0);
				Devices.setAutorun(scope.device.address, scope.device.autorun, autorun_value+0).then(function (data) {
					$timeout(function () { 
						scope.loading.toggleAutorun = false;
						scope.updateSettingsScope();
					}, 4000);
				});
			}

			scope.isAutorun = function () {
				return (scope.device.autorun + 0) == 1;
			}

			scope.showRegulationModal = function() {
				var autorunMax = scope.device.autorun_max;
				ModalService.showModal({
					templateUrl: AppConfig.templates.regulationModal,
					controller: ['$scope', 'close', function (scope, close) {
						scope.maximum = autorunMax;
						scope.close = function (param) { close(param); }	
					}],
					controllerAs: 'autorun'
				}).then(function(modal) {
					modal.element.modal();
					modal.close.then(function(result) {
						if (result === false) return;
						if (result >= 0) {
							scope.setAutorun(result);
							scope.updateSettingsScope();
						}
					});
				});
			};

			scope.turnOff = function () {
				scope.loading.toggleOnOff = true;
				Devices.regulate(scope.device.address, 0).then(function (data) {
					$timeout(function () { scope.loading.toggleOnOff = false }, 4000);
				});				
			}

			scope.turnOn = function () {
				scope.loading.toggleOnOff = true;
				Devices.regulate(scope.device.address, 100).then(function (data) {
					$timeout(function () { scope.loading.toggleOnOff = false }, 4000);
				});				
			}

			scope.toggleOnOff = function ($event) {
				if (scope.loading.toggleOnOff) {
					$event.stopPropagation();
					return false;
				}

				if (scope.device.regulation == 100) {
					scope.turnOff();
				} else {
					scope.turnOn();
				}
			}

			scope.updateSettingsScope = function() {
				settingsScope.device.autorun = scope.device.autorun;
				settingsScope.device.autorun_max = scope.device.autorun_max;
			}

			scope.openSettings = function () {
				settingsScope = scope.$new();
				settingsScope.device = angular.copy(scope.device);

				ModalService.showModal({
					templateUrl: AppConfig.templates.configModal,
					scope: settingsScope,
					showClose: true,
					animation: false,
					controller: ['$scope', 'close', function (scope, close) {
						scope.close = function (param) { close(param); }	
					}],
					controllerAs: 'config'
				}).then(function(modal) {
					modal.element.modal();
					modal.close.then(function(result) {
						if (result === false) return;
						//scope.device = angular.copy(result);
						for (var i in {'autorun':1, 'autorun_max':1, 'alias':1, 'description':1, 'phase':1, 'max_consumption':1, 'priority': 1, 'is_linear':1 }) {
							scope.device[i] = result[i];
						}
						scope.saveDevice();
					});
				});				
			}

			
			scope.saveDevice = function () {
				Devices.save(scope.device).then(function (data) {
					scope.$emit('reloadDevices');
				});	
			}


			scope.showStatsModal = function() {
				statsScope = scope.$new();
				statsScope.device = angular.copy(scope.device);

				ModalService.showModal({
					scope: settingsScope,
					templateUrl: AppConfig.templates.statsModal,
					controller: ['$scope', 'close', function (scope, close) {
						scope.close = function (param) { close(param); }
					}],
					controllerAs: 'stats'
				}).then(function(modal) {
					modal.element.modal();
					modal.close.then(function(result) {
					});
				});
			};

		}
	}
}]);