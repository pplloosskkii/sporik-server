sporikApp.directive('elmerReading', ['Elmer', '$timeout', function(Elmer, $timeout) {
  return {
    restrict: 'E',
    replace:true,
    template: '<div class="pull-right" ng-if="hasElmer()"><div class="elmer box"><label class="label label-default p1">P1: {{ elmer[\'P1A+\'] / 10 }} W</label><br><label class="label label-default p2">P2: {{ elmer[\'P2A+\'] / 10 }} W</label><br><label class="label label-default p3">P3: {{ elmer[\'P3A+\'] / 10 }} W</label></div></div>',
    link: function(scope, element, attrs) {

    	scope.loadElmer = function (callback) {
    		scope.loading = true;

			Elmer.get().then(function (data) {
	    		scope.elmer = {};
				scope.elmer = data.data;

				$timeout(scope.loadElmer, 2500);
				callback && callback();
			}, function () {
				scope.elmer.ok = false;
				$timeout(scope.loadElmer, 10000);
			}).catch(function () {
				main.elmer.ok == false;
				$timeout(scope.loadElmer, 10000);
			});
		}

		scope.hasElmer = function () {
			return (scope.loading || scope.elmer.ok);
		}

		scope.loadElmer(function () { 
			scope.loading = false;
		});
  	}
  }
}]);