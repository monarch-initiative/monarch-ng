var _ = require('underscore');
var angular = require('angular');

var step1TemplateUrl = require('!ngtemplate!html!./disease-phenotype-multi-step/step1.html');
var step2TemplateUrl = require('!ngtemplate!html!./disease-phenotype-multi-step/step2.html');
var step3TemplateUrl = require('!ngtemplate!html!./disease-phenotype-multi-step/step3.html');
var step4TemplateUrl = require('!ngtemplate!html!./disease-phenotype-multi-step/step4.html');

export default class WebPhenoteStepContainerController {
  constructor($state) {
    var that = this;
    this.name = 'webphenote-step-container';
    this.client = null;

    this.models = [
      {
        title: 'Parkinson\'s Disease',
        description:
          `Associates Parkinson's Disease with its phenotypes.`
      },
      {
        title: 'Diabetes Mellitus',
        description:
          `Associates Diabetes Mellitus with its phenotypes.`
      }
    ];

    this.model = {
        domain: $state.current.data.domain,
        model: {},
        disease: 'NODISEASE',
        phenotype: 'NOPHENOTYPE',
        onset: 'NOONSET',
        evidence: 'NOEVIDENCE'
    };

    this.steps = [
        {
            templateUrl: step1TemplateUrl,
            title: 'Saving data'
        },
        {
            templateUrl: step2TemplateUrl,
            hasForm: true,
            title: 'Using scope inheritance'
        },
        {
            templateUrl: step3TemplateUrl,
            hasForm: true,
            isolatedScope: true,
            controller: 'WebPhenoteStepIsolatedController',
            controllerAs: 'isolated',
            title: 'Isolated step scopes'
        },
        {
            templateUrl: step4TemplateUrl,
            title: 'Your name is...'
        }
    ];


  }

  useModel(model) {
    this.model.model = model;
  }
}

WebPhenoteStepContainerController.$inject = ['$state'];
