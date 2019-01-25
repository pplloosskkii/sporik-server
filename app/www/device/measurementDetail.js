sporikApp.directive('measurement', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      type: '=',
      label: '=',
      warningText: '=',
      errorText: '=',
    },
    templateUrl: 'app/www/device/measurementDetail.html',
    controller: ['$scope', function ($scope) {
        var vm = $scope;
    }],
    link: function(scope, element, attrs) {

  	}
}
}]);

