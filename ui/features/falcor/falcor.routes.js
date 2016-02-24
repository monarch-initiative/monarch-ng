var falcorTpl = require('./falcor.html');

export default function routes($stateProvider) {
  $stateProvider
    .state('falcor', {
      url: '/falcor',
      templateUrl: falcorTpl,
      controller: 'FalcorController',
      controllerAs: 'falcor'
    });
}

routes.$inject = ['$stateProvider'];
