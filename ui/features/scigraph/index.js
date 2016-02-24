import './scigraph.less';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './scigraph.routes';
import SciGraphController from './scigraph.controller';
import scigraph from '../../services/scigraph.service';

export default angular.module('app.scigraph', [uirouter, scigraph])
  .config(routing)
  .controller('SciGraphController', SciGraphController)
  .name;
