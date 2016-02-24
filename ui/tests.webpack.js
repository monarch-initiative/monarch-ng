// This file is an entry point for angular tests
// Avoids some weird issues when using webpack + angular.

import 'angular';
import 'angular-ui-bootstrap';
import 'angular-mocks/angular-mocks';
import './app.js';



var testsContext = require.context('.', true, /.test$/);
testsContext.keys().forEach(testsContext);

