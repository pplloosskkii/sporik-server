sporikApp.directive('deviceChart', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    replace:true,
    scope: {
      data: '='
    },
    template: '<div><canvas id="line" class="chart chart-line" chart-data="all" chart-options="options" chart-labels="labels" height="100"></canvas></div>',
    link: function(scope, element, attrs) {
      scope.all = [[]];
      scope.labels = [];
      scope.options = {
        animation: {
          duration: 0
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
      };

    	//scope.$watch('data', function (newVal, oldVal) {


      scope.go = function () {
        scope.all[0].push(scope.data);
        scope.labels.push('');

        if (scope.all[0].length > 20) {
          scope.all[0].shift();
          scope.labels.shift();
        }

        $timeout(scope.go, 2000);
    	};

      scope.go();
  	}
}
}]);

