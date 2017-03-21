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
    },
    template:   '<div class="box pull-right chart-elmer">\
                  <canvas id="line" class="chart chart-line" chart-data="all" \
                     chart-colors="colors" chart-options="options" chart-labels="labels" width="{{ width }}" height="{{ height }}">\
                  </canvas> \
                </div>',

    link: function(scope, element, attrs) {
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
            scope.all.push(newVal['p' + scope.phase]);
          } else {
            scope.all[0].push(newVal.p1);
            scope.all[1].push(newVal.p2);
            scope.all[2].push(newVal.p3);
          }

          scope.labels.push('');
        }

        if (scope.all.length > 50 || (typeof scope.all[1] != 'undefined' && scope.all[1].length > 50)) {

          if (typeof attrs.phase != 'undefined') {
            scope.all.shift();
          } else {
            scope.all[0].shift();
            scope.all[1].shift();
            scope.all[2].shift();
          }
          scope.labels.shift();
        }
      });
    }
}
}]);

