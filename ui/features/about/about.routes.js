var aboutTpl = require('./about.html');

export default function routes($stateProvider) {
  $stateProvider
    .state('about', {
      url: '/about',
      templateUrl: aboutTpl,
      controller: 'AboutController',
      controllerAs: 'about'
    });
}

routes.$inject = ['$stateProvider'];
