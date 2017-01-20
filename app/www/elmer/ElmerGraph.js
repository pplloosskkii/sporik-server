sporikApp.directive('elmerChart', [function() {
  return {
    restrict: 'E',
    replace:true,
    scope: {
      data: '='
    },
    template: '<div class="box pull-right chart-elmer"><canvas id="line" class="chart chart-line" chart-data="all" chart-colors="colors" chart-options="options" chart-labels="labels" width="400" height="90"></canvas></div>',
    link: function(scope, element, attrs) {
      scope.all = [[], [], []];
      scope.labels = [];
      scope.colors = ['#cc0000', '#00cc00', '#00cccc'];
      scope.options = {
        animation: {
          duration: 0
        },
        elements: {
          line: {
            borderWidth: 0.5
          },
          point: {
            radius: 0
          }
        },
      };

      scope.$watch('data', function (newVal, oldVal) {

        if (typeof newVal != 'undefined' && typeof newVal['ok'] != 'undefined') {
          scope.all[0].push(newVal['P1A+'] / 10);
          scope.all[1].push(newVal['P2A+'] / 10);
          scope.all[2].push(newVal['P3A+'] / 10);

          scope.labels.push('');
        }

        if (scope.all[0].length > 50) {
          scope.all[0].shift();
          scope.all[1].shift();
          scope.all[2].shift();
          scope.labels.shift();
        }
      });
    }
}
}]);

