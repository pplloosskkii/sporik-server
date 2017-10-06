sporikApp.directive('elmerChart', [function() {
  return {
    restrict: 'E',
    replace:true,
    scope: {
      data: '=',
      phase: '@',
      width: '@',
      height: '@',
      colors: '=',
      columns: '@',
    },
    template:   '<div class="chart-elmer">\
                  <canvas id="line" class="chart chart-line" chart-data="all" \
                     chart-colors="colors" chart-options="options" chart-labels="labels" width="{{ width }}" height="{{ height }}">\
                  </canvas> \
                </div>',

    link: function(scope, element, attrs) {

      var maxCols = attrs.columns || 50;

      scope.all = [[], [], []];
      scope.labels = [];
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
      if (typeof attrs.phase != 'undefined') {
        scope.all = [];
      }

      scope.$watch('data', function (newVal, oldVal) {
        if (typeof newVal != 'undefined' && typeof newVal.ok != 'undefined' && newVal.ok == true) {
          if (typeof attrs.phase != 'undefined') {
            scope.all.unshift(newVal['p' + scope.phase]);
          } else {
            scope.all[0].unshift(newVal.p1);
            scope.all[1].unshift(newVal.p2);
            scope.all[2].unshift(newVal.p3);
          }

          scope.labels.push('');
        }

        if (scope.all.length > maxCols || (typeof scope.all[1] != 'undefined' && scope.all[1].length > maxCols)) {

          if (typeof attrs.phase != 'undefined') {
            scope.all.pop();
          } else {
            scope.all[0].pop();
            scope.all[1].pop();
            scope.all[2].pop();
          }
          scope.labels.shift();
        }
      });
    }
}
}]);

