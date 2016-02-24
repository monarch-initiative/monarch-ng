var d3Tpl = require('./d3.html');

export default function routes($stateProvider) {
  $stateProvider
    .state('d3', {
      url: '/d3',
      templateUrl: d3Tpl,
      controller: 'D3Controller',
      controllerAs: 'd3'
    });
}

routes.$inject = ['$stateProvider'];
