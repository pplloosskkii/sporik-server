sporikApp.controller('sporikDashboard', ['Devices', 'Elmer', '$timeout', function(Devices, Elmer, $timeout) {
	scope = this;
	scope.elmer = {};

	load = function () {

	}


	// for future use
	scope.get = function (address) {
		Devices.get(address).then(function (data) {
			//
		});
	}



	load();

}]);