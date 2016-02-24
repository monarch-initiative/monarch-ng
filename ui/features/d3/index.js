import './d3.less';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './d3.routes';
import D3Controller from './d3.controller';

import d3 from 'd3';
global.d3 = d3;

import nvd3 from 'nvd3';
global.nvd3 = nvd3;
import 'nvd3/build/nv.d3.css';

export default angular.module('app.d3', [uirouter, 'nvd3'])
  .config(routing)
  .controller('D3Controller', D3Controller)
  .name;

