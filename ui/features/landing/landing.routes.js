var landingTpl = require('./landing.html');

export default function routes($stateProvider) {
  $stateProvider
    .state('landing', {
      url: '/',
      templateUrl: landingTpl,
      controller: 'LandingController',
      controllerAs: 'landing'
    });
}

routes.$inject = ['$stateProvider'];
