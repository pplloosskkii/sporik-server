sporikApp.directive('chart', [function() {
  return {
    restrict: 'E',
    replace:true,
    scope: {
      data: '='
    },
    template: '<div id="bar-chart"><canvas id="bar" class="chart chart-line" chart-data="all" chart-series="series" chart-options="options"></canvas></div>',
    link: function(scope, element, attrs) {
    	scope.all = [[], [], []]; // all 3 phases
    	scope.d3handler = null;

		var height = 70,
			width = 100;

            scope.series = ['1','2','3']

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
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          display: false
        }],
        yAxes: [{
          display: false
        }],
        gridLines: {
          display: false
        }
      },
      tooltips: {
        enabled: false
      }
  };

    	scope.$watch('data', function (newVal, oldVal) {
    		if (newVal !== oldVal && typeof newVal !== 'undefined' && newVal !== null && typeof newVal['ok'] !== 'undefined') {

    			scope.all[0].push(newVal['P1A+']);
    			scope.all[1].push(newVal['P2A+']);
    			scope.all[2].push(newVal['P3A+']);
    	//		scope.repaint();
    		}
    	});

    	initGraph = function () {

			scope.d3handler = d3
				.select('#bar-chart')
				.append('svg')
				.attr('width', width)
				.attr('height', height)
				.style('background', '#eee');
    	}

    	scope.repaint = function () {
    		for (index in scope.all) {
    			repaintPhase(index);
    		}
    	}

    	var repaintPhase = function (phaseIndex) {
    		var colors = ['c00', '0c0', '0cc'];
			var chartdata = scope.all;

			var phaseOffset = (phaseIndex * (height / 3));

			var yScale = d3.scale.linear()
				.domain([0, 20000])
				.range([0, height]);

			scope.d3handler
				.selectAll()
				.data(scope.all[phaseIndex])
				.enter()
				.append('rect')
				.style({'fill': function(data,i){return colors[phaseIndex];}})
				.attr('width', 2)
				.attr('height', 1)
				.attr('x', function (data, i) {
					return i;
				})
				.attr('y', function (data, i) {
					return height - yScale(data);
				});
    	}

    	//initGraph();
  	}
}
}]);

