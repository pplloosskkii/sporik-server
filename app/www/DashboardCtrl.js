sporikApp.controller('sporikDashboard', ['Devices', 'Elmer', 'Elmer2', 'Inverter', '$interval', '$timeout', function(Devices, Elmer, Elmer2, Inverter, $interval, $timeout) {
	var $scope = this;
	$scope.elmer = { ok: false };
	$scope.elmer2 = { ok: false };
	$scope.showElmerGraph = true;
	$scope.elmerStats = { l1: { }, l2: {}, l3: {}};

	
	var processElmer = function() {
		Elmer.process(function (data) {
			$scope.elmer = angular.copy(data);
		});
		Elmer2.process(function (data) {
			$scope.elmer2 = angular.copy(data);
		});
	}
	
	var processElmerStats = function() {
		Elmer.getDailyData().then(function (data) {
			var arr = Array.from(data);
			
			for (var i = 1; i <= 3; i++) {
				$scope.elmerStats["l" + i].overflowToday = ($scope.elmer['tp' + i] - arr[arr.length - 1]["l" + i + "p"]) / 10000;
				$scope.elmerStats["l" + i].overflowYesterday = (arr[arr.length - 1]["l" + i + "p"] - arr[arr.length - 2]["l" + i + "p"]) / 10000;
				$scope.elmerStats["l" + i].overflowWeek = ($scope.elmer['tp' + i] - arr[0]["l" + i + "p"]) / 10000;

				$scope.elmerStats["l" + i].consumeToday = ($scope.elmer['tc' + i] - arr[arr.length - 1]["l" + i + "s"]) / 10000;
				$scope.elmerStats["l" + i].consumeYesterday = (arr[arr.length - 1]["l" + i + "s"] - arr[arr.length - 2]["l" + i + "s"]) / 10000;
				$scope.elmerStats["l" + i].consumeWeek = ($scope.elmer['tc' + i] - arr[0]["l" + i + "s"]) / 10000;
			}
			$scope.elmerStats.sumOverflowToday =  		$scope.elmerStats.l1.overflowToday + $scope.elmerStats.l2.overflowToday + $scope.elmerStats.l3.overflowToday;
			$scope.elmerStats.sumOverflowYesterday =  	$scope.elmerStats.l1.overflowYesterday + $scope.elmerStats.l2.overflowYesterday + $scope.elmerStats.l3.overflowYesterday;
			$scope.elmerStats.sumOverflowWeek =  		$scope.elmerStats.l1.overflowWeek + $scope.elmerStats.l2.overflowWeek + $scope.elmerStats.l3.overflowWeek;
			$scope.elmerStats.sumConsumeToday =  		$scope.elmerStats.l1.consumeToday + $scope.elmerStats.l2.consumeToday + $scope.elmerStats.l3.consumeToday;
			$scope.elmerStats.sumConsumeYesterday =  	$scope.elmerStats.l1.consumeYesterday + $scope.elmerStats.l2.consumeYesterday + $scope.elmerStats.l3.consumeYesterday;
			$scope.elmerStats.sumConsumeWeek =  		$scope.elmerStats.l1.consumeWeek + $scope.elmerStats.l2.consumeWeek + $scope.elmerStats.l3.consumeWeek;
		});
	}
	var processInverter = function() {
		Inverter.process(function (data) {
			$scope.inverter = angular.copy(data);
		});
	}

	load = function () {
		processElmer();
		processInverter();
		processElmerStats();
		
		$interval(processElmerStats, 30000);
		
		$interval(processElmer, 5000);
		$interval(processInverter, 5000);
	}

	load();

}]);