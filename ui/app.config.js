export default function routing($urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: true
  });

  // $urlRouterProvider.otherwise('/');
  // From https://github.com/angular-ui/ui-router/issues/2183
  $urlRouterProvider.otherwise(function($injector, $location) {
      var $state = $injector.get("$state");
      $state.go('landing');
  });
}

routing.$inject = ['$urlRouterProvider', '$locationProvider'];
