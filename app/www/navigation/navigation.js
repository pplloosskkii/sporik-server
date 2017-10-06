sporikApp.directive('sporikNavigation', ['$rootScope', 'ModalService', 'AppConfig', '$http', function($rootScope, ModalService, AppConfig, $http) {
  return {
    restrict: 'EA',
    templateUrl: './app/www/navigation/navigation.html',
    link: function(scope, element, attrs) {

      scope.version = AppConfig.about.version;

      scope.restartServer = function () {
        $http.get(AppConfig.apiUrl + '/restart').$promise.then(function () {
          // whatever happened, is not my bussiness 
        })
      }


      scope.showAbout = function () {
        ModalService.showModal({
          templateUrl: AppConfig.templates.aboutModal,
          controller: ['$scope', 'close', 'AppConfig', function (scope, close, AppConfig) {
            scope.version = AppConfig.about.version;
            scope.close = function (param) { close(param); }  
          }],
          controllerAs: 'about'
        }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function(result) {
          });
        });
      }

      scope.addNewDevice = function () {
        settingsScope = scope.$new();
        settingsScope.device = {'autorun':1, 'autorun_max':0, 'alias': 'Spořík', 'description':'Standardní spořík', 'phase':1, 'max_consumption':100};

        ModalService.showModal({
          templateUrl: AppConfig.templates.configModal,
          scope: settingsScope,
          showClose: true,
          controller: ['$scope', 'close', function (scope, close) {
            scope.isCreatingNew = true;
            scope.close = function (param) { close(param); }  
          }],
          controllerAs: 'config'
        }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function(result) {
            console.log("aaa")
            if (result === false) return;
            scope.device = angular.copy(result);
            for (var i in {'address': 1, 'autorun':1, 'autorun_max':1, 'alias':1, 'description':1, 'phase':1, 'max_consumption':1}) {
              scope.device[i] = result[i];
            }
            console.log(scope.device)
            //scope.saveDevice();
          });
        });       
      }

  	},
  }
}]);