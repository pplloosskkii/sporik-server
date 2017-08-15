sporikApp.directive('elmerReading', ['Elmer', '$timeout', function(Elmer, $timeout) {
  return {
    restrict: 'E',
    replace:true,
    template: 	'<div class="pull-right" ng-if="hasElmer()"> \
    				<div class="elmer box"> \
	    				<label class="label label-default p1"> \
	    					L1: {{ elmer.p1 }}&nbsp;W</label> \
	    				<br><label class="label label-default p2"> \
							L2: {{ elmer.p2 }}&nbsp;W</label> \
						<br><label class="label label-default p3"> \
							L3: {{ elmer.p3 }}&nbsp;W</label> \
						<br> \
					</div> \
				</div>',
    link: function(scope, element, attrs) {

		scope.elmer = {
			p1: '??',
			p2: '??',
			p3: '??',
			overflow: [0,0,0],
			ok: false,
		}

    	scope.loadElmer = function (callback) {
    		scope.loading = true;

			Elmer.get().then(function (data) {

				var o1 = data.data['overflow'][0] || 0;
				var o2 = data.data['overflow'][1] || 0;
				var o3 = data.data['overflow'][2] || 0;
				var p1 = (o1 > 0 ? '+' : '-') + "" + (data.data['P1A+'] / 10);
				var p2 = (o2 > 0 ? '+' : '-') + "" + (data.data['P2A+'] / 10);
				var p3 = (o3 > 0 ? '+' : '-') + "" + (data.data['P3A+'] / 10);

				scope.elmer = {
					p1: p1,
					p2: p2,
					p3: p3,
					overflow: data.data['overflow'],
					ok: true,
				}

				$timeout(scope.loadElmer, 2500);
				callback && callback();
			}, function () {
				scope.elmer.ok = false;
				$timeout(scope.loadElmer, 10000);
			}).catch(function () {
				scope.elmer.ok = false;
				$timeout(scope.loadElmer, 10000);
			});
		}

		scope.hasElmer = function () {
			return (scope.loading || (scope.elmer && scope.elmer.ok));
		}

		scope.loadElmer(function () { 
			scope.loading = false;
		});
  	}
  }
}]);