sporikApp.directive('deviceChart', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    template: '<div><canvas id="line" class="chart chart-line" chart-data="all" chart-options="options" chart-labels="labels" height="80"></canvas></div>',
    link: function(scope, element, attrs) {
      scope.all = [[]];
      scope.labels = [];
      scope.options = {
        //events: ['click'],
        animation: {
          duration: 0
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true,
                    stepsize:10,
                    max:scope.data.max_consumption
                }
            }]
        }
      };

    	//scope.$watch('data', function (newVal, oldVal) {


      scope.go = function () {
        scope.all[0].unshift(scope.data.measurement_recount);
        scope.labels.unshift('');

        if (scope.all[0].length > 20) {
          scope.all[0].pop();
          scope.labels.pop();
        }

        $timeout(scope.go, 2000);
    	};

      scope.go();
  	}
}
}]);

