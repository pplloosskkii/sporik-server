sporikApp.directive('deviceStats', ['Devices', function(Devices) {
	return {
		restrict: 'E',
		scope: {
			address: '='
		},
		template: '<div><canvas id="line" class="chart chart-line" chart-data="all" chart-options="options" chart-labels="labels" chart-series="series" height="100"></canvas></div>',
		link: function(scope, element, attrs) {
			scope.all = [[]];
			scope.labels = [];
			scope.series = ['Denní spotřeba zařízení (kWh)', 'Celková spotřeba (kWh)'];
			scope.options = {
				legend: {display: true},				
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero:true
						}
					}]
				}
			};
			scope.chartVisible = false;
			
			function init() {
				Devices.fetchStats(scope.address).then(function (stats) {
					if (stats.data.length > 0) {
						scope.chartVisible = true;
					}

					scope.all = [ 
						stats.data.map(function (item) {
							return item.day_total
						}),
						stats.data.map(function (item) {
							return item.total
						}),
					]

					

					scope.labels = stats.data.map(function (item) {
						var date = new Date(item.max_date);
						var ret = date.getDate() + "." + (date.getMonth()) + "." + date.getFullYear();
						console.log("input:",item.max_date, "date:",date, "ret",ret);
						return ret;
					})

					console.log(scope.labels)
				})
			}

			init();
		}
	}
}]);

