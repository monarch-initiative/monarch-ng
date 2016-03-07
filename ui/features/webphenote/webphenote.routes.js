var webphenoteTpl = require('./webphenote.html');
var webphenoteStepContainerTpl = require('./webphenote-step-container.html');

export default function routes($stateProvider) {
  $stateProvider
    .state('webphenote', {
      url: '/webphenote',
      templateUrl: webphenoteTpl,
      controller: 'WebPhenoteController',
      controllerAs: 'webphenote'
    })
    .state('disease-phenotype-multi-step', {
      url: '/disease-phenotype-multi-step',
      templateUrl: webphenoteStepContainerTpl,
      controller: 'WebPhenoteStepContainerController',
      controllerAs: 'stepcontainer',
      data: {
        domain: 'disease-phenotype-multi-step'
      }
    })
    .state('disease-metabolomic-multi-step', {
      url: '/disease-metabolomic-multi-step',
      templateUrl: webphenoteStepContainerTpl,
      controller: 'WebPhenoteStepContainerController',
      controllerAs: 'stepcontainer',
      data: {
        domain: 'disease-metabolomic-multi-step'
      }
    });
}

routes.$inject = ['$stateProvider'];
