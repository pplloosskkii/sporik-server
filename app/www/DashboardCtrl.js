sporikApp.controller('sporikDashboard', ['Devices', 'Elmer', '$interval', function(Devices, Elmer, $interval) {
	var $scope = this;
	$scope.elmer = { ok: false };
	$scope.showElmerGraph = true;

	
	var processElmer = function() {
		Elmer.process(function (data) {
			$scope.elmer = angular.copy(data);
		});
	}

	load = function () {
		processElmer();
	
		$interval(processElmer, 2500);
	}

	load();

}]);