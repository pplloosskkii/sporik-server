sporikApp.directive('elmerOwerflowChart', [function() {
  return {
    restrict: 'E',
    replace:true,
    scope: {
      data: '='
    },
    template: '<div class="box pull-right chart-elmer"><canvas id="line" class="chart chart-line" chart-data="all" chart-colors="colors" chart-options="options" chart-labels="labels" width="200" height="90"></canvas></div>',
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
        if (typeof newVal != 'undefined' && typeof newVal['ok'] != 'undefined' && newVal['ok'] == true) {
          scope.all[0].unshift(newVal.overflow[0] * 100);
          scope.all[1].unshift(newVal.overflow[1] * 100);
          scope.all[2].unshift(newVal.overflow[2] * 100);
          scope.labels.push('');
        }

        if (scope.all[0].length > 25) {
          scope.all[0].pop();
          scope.all[1].pop();
          scope.all[2].pop();
          scope.labels.pop();
        }
      });
    }
}
}]);

