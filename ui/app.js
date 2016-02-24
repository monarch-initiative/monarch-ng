/* eslint-disable */

// require('offline-plugin/runtime').install();

// import wreck from 'wreck';
import ng from 'angular';
import nguirouter from 'angular-ui-router';
import ngsanitize from 'angular-sanitize';
import nganimate from 'angular-animate';
import nguibootstrap from 'angular-ui-bootstrap';
import './favicon.ico';

import 'angular-fontawesome';
import 'font-awesome/css/font-awesome.min.css';

import routing from './app.config';
import falcor from './features/falcor';
import scigraph from './features/scigraph';
import landing from './features/landing';
import d3feature from './features/d3';
import about from './features/about';
import settings from './features/settings';
import navbar from './features/navbar';
import './themes/default/index.less';
import './themes/default/titledlogo.png';
import jsonformatter from 'jsonformatter';
import jsonformatterCSS from 'jsonformatter/dist/json-formatter.min.css';
import scroll from './directives/scroll.directive.js';
import ngfileselect from './directives/fileselect.directive.js';

import d3 from 'd3';
global.d3 = d3;

import nvd3 from 'nvd3';
global.nvd3 = nvd3;
import 'angular-nvd3';


(function () {
  var app = ng.module('app',
            [nguirouter, ngsanitize, nguibootstrap, nganimate,
            'nvd3', 'picardy.fontawesome',
            jsonformatter, scroll, ngfileselect,
            landing, falcor, scigraph, d3feature, about, settings, navbar],
            function($rootScopeProvider) {
                $rootScopeProvider.digestTtl(15);
            });

	app.config(routing);
  app.config(function (JSONFormatterConfigProvider) {
      JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    });
  app.run(
    function ($timeout, $state, $location, $rootScope) {
      $rootScope.showNavbar = function () {
        return $location.path() !== '/kiosk';
      };
      $rootScope.showKiosk = function () {
        return $location.path() === '/kiosk';
      };
      // console.log('$location.path:', $location.path());
      // if ($location.path() === '/') {
      //   $timeout(
      //     function () {
      //       console.log('go landing');
      //       $state.go('landing');
      //     },
      //     10);
      // }
    });
}());
