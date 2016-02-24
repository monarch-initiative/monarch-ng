var useLocalFalcorDB = false;

var _ = require('underscore');
var falcor = require('falcor');
import HttpDataSource from 'falcor-http-datasource';

if (useLocalFalcorDB) {
  var falcorRouterFactory = require('../../server/falcor');
}

import angular from 'angular';

class Netflix {
  constructor($q) {
    var service = {};
    /* eslint func-style: 0 */

    var model;
    if (useLocalFalcorDB) {
      var falcorRouterInstance = falcorRouterFactory('1');
      model = new falcor.Model({
          source: falcorRouterInstance
      });

    }
    else {
      // create model:
      model = new falcor.Model({
          source: new HttpDataSource('/model.json')
      });
    }

    service.model = model;

    return service;
  }
}

export default angular.module('services.netflix', [])
  .service('netflix', Netflix)
  .name;
