import './landing.less';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './landing.routes';
import LandingController from './landing.controller';

export default angular.module('app.landing', [uirouter])
  .config(routing)
  .controller('LandingController', LandingController)
  .name;

