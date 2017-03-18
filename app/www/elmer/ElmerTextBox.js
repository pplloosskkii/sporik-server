sporikApp.directive('elmerReading', ['Elmer', '$timeout', function(Elmer, $timeout) {
  return {
    restrict: 'E',
    replace:true,
    template: 	'<div class="pull-right" ng-if="hasElmer()"> \
    				<div class="elmer box"> \
	    				<label class="label label-default p1"> \
	    					P1: {{ elmer.p1 }}&nbsp;W</label> \
	    				<br><label class="label label-default p2"> \
							P2: {{ elmer.p2 }}&nbsp;W</label> \
						<br><label class="label label-default p3"> \
							P3: {{ elmer.p3 }}&nbsp;W</label> \
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
				scope.elmer = {
					p1: data.data['P1A+'] / 10,
					p2: data.data['P2A+'] / 10,
					p3: data.data['P3A+'] / 10,
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