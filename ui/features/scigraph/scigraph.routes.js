var scigraphTpl = require('./scigraph.html');

export default function routes($stateProvider) {
  $stateProvider
    .state('scigraph', {
      url: '/scigraph',
      templateUrl: scigraphTpl,
      controller: 'SciGraphController',
      controllerAs: 'scigraph'
    });
}

routes.$inject = ['$stateProvider'];
