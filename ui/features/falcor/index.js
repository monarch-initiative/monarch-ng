import './falcor.less';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './falcor.routes';
import FalcorController from './falcor.controller';

import netflix from '../../services/netflix.service';

export default angular.module('app.falcor', [uirouter, netflix])
  .config(routing)
  .controller('FalcorController', FalcorController)
  .name;
