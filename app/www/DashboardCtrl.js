sporikApp.controller('sporikDashboard', ['Devices', 'Elmer', '$interval', function(Devices, Elmer, $interval) {
	var $scope = this;
	$scope.elmer = { ok: false };
	$scope.showElmerGraph = true;

	load = function () {
		$interval(function () {
			Elmer.process(function (data) {
				$scope.elmer = angular.copy(data);
			});
		}, 2500);
	}

	load();

}]);