var useBrowserService = false;

var _ = require('underscore');
var falcor = require('falcor');
import HttpDataSource from 'falcor-http-datasource';

if (useBrowserService) {
  var scigraphRouterFactory = require('../../server/scigraph');
}

import angular from 'angular';

class SciGraphService {
  constructor($q, $rootScope, $location) {
    var that = this;
    this.$rootScope = $rootScope;
    // var service = {};
    // service.service = this;
    this.service = this;
    /* eslint func-style: 0 */

    if (useBrowserService) {
      scigraphRouterFactory('APIKey', null, function(scigraphRouterInstance) {
        that.service.model = new falcor.Model({
            source: scigraphRouterInstance
        });
        $rootScope.$emit('scigraph-service-initialized');
      });
    }
    else {
      // create model:
      this.model = new falcor.Model({
          source: new HttpDataSource('/scigraph.json', {
            timeout: 0
          })
      });
      $rootScope.$emit('scigraph-service-initialized');
    }

    return this;
  }


  getPartitionedNeighbors(id) {
    var that = this;

    var result = new Promise(
      function(resolve, reject) {
        var neighborsLengthPath = 'nodes["' + id + '"]neighbors.length';
        that.model.get(neighborsLengthPath).then(
          function(neighborsLengthResponse) {
            var neighborsLength = neighborsLengthResponse.json.nodes[id].neighbors.length;
            var neighborsPath = 'nodes["' + id + '"].neighbors[0..' + (neighborsLength - 1) + ']["sub", "obj", "pred", "meta"]';
            that.model.get(neighborsPath).then(
              function (neighborsResponse) {
                var neighborsMap = neighborsResponse.json.nodes[id].neighbors;
                var partitionMap = {};
                for (var key = 0; key < neighborsLength; ++key) {
                  var value = neighborsMap[key];
                  var partitionKey = value.pred;
                  var targetObject = value.sub;
                  if (targetObject === id) {
                    targetObject = value.obj;
                    partitionKey = '~' + partitionKey;
                  }
                  var partition = partitionMap[partitionKey] || (partitionMap[partitionKey] = []);

                  if (partition.length < 100) {
                    partition.push(targetObject);
                  }
                }

                resolve(partitionMap);
              },
              function (z2) {
                console.log('z2:', z2);
                reject(z2);
              });
          },
          function(errorResponse) {
            resolve(errorResponse);
          });
        });

    return result;
  }
}

export default angular.module('services.scigraph', [])
  .service('scigraph', SciGraphService)
  .name;
