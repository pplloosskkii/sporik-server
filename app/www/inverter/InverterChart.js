sporikApp.directive('inverterChart', [function() {
  return {
    restrict: 'E',
    replace:true,
    scope: {
      data: '=',
      width: '@',
      height: '@',
    },
    template:   '<div class="chart-elmer">\
                  <canvas id="line2" class="chart chart-line" chart-data="all" \
                     chart-options="options" chart-labels="labels" width="{{ width }}" height="{{ height }}">\
                  </canvas> \
                </div>',

    link: function(scope, element, attrs) {

      var maxCols = attrs.columns || 50;

      scope.all = [];
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
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true,
                    // stepsize:10,
                    // max:10000
                }
            }],
        }
      };

      scope.$watch('data', function (newVal, oldVal) {
        if (typeof newVal != 'undefined' && typeof newVal.ok != 'undefined' && newVal.ok == true) {
            var val = newVal.data.Body.Data.Inverters['1']['P'];
            scope.all.unshift(val);
            scope.labels.push(' ');
        }
        if (scope.all.length > maxCols) {
            scope.all.pop();
            scope.labels.pop();
        }
      });
    }
};
}]);

