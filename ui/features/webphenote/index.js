import './webphenote.less';

import angular from 'angular';
import uirouter from 'angular-ui-router';
import multiStepForm from 'angular-multi-step-form';

import routing from './webphenote.routes';
import WebPhenoteController from './webphenote.controller';
import WebPhenoteStepContainerController from './webphenote-step-container.controller';
import WebPhenoteStepIsolatedController from './webphenote-step-isolated.controller';

var webphenoteModule = angular.module('app.webphenote', [uirouter, 'multiStepForm']);

webphenoteModule.config(routing);
webphenoteModule.controller('WebPhenoteController', WebPhenoteController);
webphenoteModule.controller('WebPhenoteStepIsolatedController', WebPhenoteStepIsolatedController);
webphenoteModule.controller('WebPhenoteStepContainerController', WebPhenoteStepContainerController);

export default {
  WebPhenoteController: WebPhenoteController,
  WebPhenoteStepContainerController: WebPhenoteStepContainerController
};
