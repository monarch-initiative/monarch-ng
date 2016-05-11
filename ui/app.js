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
import scigraph from './features/scigraph';
import landing from './features/landing';
import webphenoteModule from './features/webphenote';
import about from './features/about';
import settings from './features/settings';
import navbar from './features/navbar';
import './themes/default/index.less';
import './themes/default/titledlogo.png';
import jsonformatter from 'jsonformatter';
import jsonformatterCSS from 'jsonformatter/dist/json-formatter.min.css';
import scroll from './directives/scroll.directive.js';
import ngfileselect from './directives/fileselect.directive.js';
import multiStepForm from 'angular-multi-step-form/dist/commonjs';

import d3 from 'd3';
global.d3 = d3;


(function () {
  var app = ng.module('app',
            [nguirouter, ngsanitize, nguibootstrap, nganimate,
            'picardy.fontawesome',
            jsonformatter, scroll, ngfileselect, multiStepForm.name,
            landing, scigraph,
            'app.webphenote',
            about, settings, navbar],
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
    });
}());
