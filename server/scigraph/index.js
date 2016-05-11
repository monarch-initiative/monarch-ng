'use strict';

var Router = require('falcor-router');
// var Promise = require('promise');

var jsonGraph = require('falcor-json-graph');
var $ref = jsonGraph.ref;
var $error = jsonGraph.error;

// from: http://stackoverflow.com/questions/17575790/environment-detection-node-js-or-browser
var isNodeJS = new Function("try {return this===global;}catch(e){return false;}"); /* eslint no-new-func: 0 */

var SciGraphService = require('./scigraph-service');

var classEntries = [];

classEntries.push({
  route: "relationshipTypes",
  get: function(pathSet) {
        return this.scigraphService.getRelationshipTypes().
          then(
            function(relationshipTypes) {
              var result =
              {
                path: ['relationshipTypes'],
                value: {$type: "atom", value: relationshipTypes}
              };

              return result;
            });
      }
  }
);

classEntries.push({
  route: "properties",
  get: function(pathSet) {
        return this.scigraphService.getProperties().
          then(
            function(properties) {
              var result =
              {
                path: ['properties'],
                value: {$type: "atom", value: properties}
              };

              return result;
            });
      }
  }
);


classEntries.push({
  route: "edges[{keys:edgeTypes}].length",
  get: function(pathSet) {
    return this.scigraphService.getEdges(pathSet.edgeTypes).
      then(
        function(edgeLists) {
          console.log('EDGELISTS', edgeLists);
          var results = [];

          pathSet.edgeTypes.forEach(
            function(edgeType) {
              console.log(' edgeType', edgeType, edgeLists[edgeType]);

              if (edgeLists[edgeType]) {
                results.push({
                    path: ['edges', edgeType, 'length'],
                    value: edgeLists[edgeType].length
                });
              }
              else {
                // x
              }
            });

          console.log('EDGESRETURN', results);

          return results;
        });
  }
});




classEntries.push({
  route: "nodes[{keys:ids}].neighbors.length",
  get: function(pathSet) {
    return this.scigraphService.getNeighbors(pathSet.ids, null, 'BOTH').
      then(
        function(edgeNodeLists) {
          var results = [];

          pathSet.ids.forEach(
            function(id) {
              if (edgeNodeLists[id]) {
                results.push({
                    path: ['nodes', id, 'neighbors', 'length'],
                    value: edgeNodeLists[id].length
                });
              }
              else {
                // x
              }
            });

          return results;
        });
  }
});


classEntries.push({
  route: "nodes[{keys:ids}].neighbors[{integers:neighborIndices}]['sub', 'obj', 'pred', 'meta']",
  get: function(pathSet) {
    return this.scigraphService.getNeighbors(pathSet.ids, null, 'BOTH').
      then(
        function(neighborLists) {
          var results = [];

          pathSet.ids.forEach(
            function(id) {
              var neighborList = neighborLists[id];

              var neighbors = [];
              pathSet.neighborIndices.forEach(function(neighborIndex) {
                  var neighborEdge = neighborList[neighborIndex];

                  results.push({
                      path: ['nodes', id, 'neighbors', neighborIndex],
                      value: {
                        $type: "atom",
                        value: {
                          sub: neighborEdge.sub,
                          obj: neighborEdge.obj,
                          pred: neighborEdge.pred,
                          meta: neighborEdge.meta
                        }
                      }
                  });
              });
            });

          return results;
        });
  }
});




/*
 *  The commented-out entries below are a work in progress.
 *  These will be fleshed out as we learn more about the desired model.json model.
 */

/*
classEntries.push({
  route: "nodes[{keys:ids}]['id', 'lbl', 'meta', 'edgeSets']",
  get: function(pathSet) {
        return this.scigraphService.getNodes(pathSet.ids).
          then(
            function(nodes) {
              var results = [];

              pathSet.ids.forEach(
                function(id) {
                  pathSet[2].forEach(
                    function(key) {
                      results.push({
                          path: ['nodes', id, key],
                          value: 'VALUE ' + id + ' ' + key
                      });
                    });
                });

              return results;
            });
      }
});
*/

/*
classEntries.push({
  route: "roots[{integers:indices}].title",
  get: function (pathSet) {
      return this.scigraphService.
          getRoots().
          then(function(roots) {
              // use the indices alias to retrieve the array (equivalent to pathSet[1])
              return pathSet.indices.map(function(index) {
                  var list = roots[index];

                  if (list === null) {
                      return { path: ["roots", index], value: list };
                  }

                  return {
                      path: ['roots', index, 'title'],
                      value: roots[index].title
                  };
              });
          });
  }
});
*/

/*

classEntries.push({
  route: "roots[{integers:indices}].properties[{integers:propertyIndices}]",
  get: function (pathSet) {
      return this.scigraphService.
          getRoots().
          then(function(roots) {
              var pathValues = [];
              pathSet.indices.forEach(function (index) {
                  var root = roots[index];

                  // If we determine that there is no root at the index, we must
                  // be specific and return that it is the root that is not
                  // present and not the name of the root.
                  if (root === null) {
                      pathValues.push({
                          path: ['roots', index],
                          value: root
                      });
                  }
                  else {
                      pathSet.propertyIndices.forEach(function(propertyIndex) {
                          var property = root.properties[propertyIndex];

                          if (property === null) {
                              pathValues.push({ path: ["roots", index, "properties", propertyIndex], value: property });
                          }
                          else {
                              pathValues.push({
                                  path: ['roots', index, 'properties', propertyIndex],
                                  value: property
                              });
                          }
                      });
                  }
              });
              return pathValues;
          });
  }
});
*/

/*

classEntries.push({
  route: "roots[{integers:indices}].nodes[{integers:nodeIndices}]",
  get: function (pathSet) {
      return this.scigraphService.
          getRoots().
          then(function(roots) {
              var pathValues = [];
              pathSet.indices.forEach(
                function (index) {
                  var root = roots[index];

                  // If we determine that there is no root at the index, we must
                  // be specific and return that it is the root that is not
                  // present and not the name of the root.
                  if (root === null) {
                    pathValues.push({
                        path: ['roots', index],
                        value: root
                    });
                  }
                  else {
                    pathSet.nodeIndices.forEach(function(nodeIndex) {
                      var nodeId = root.nodes[nodeIndex].nodeId;
                      if (nodeId === null) {
                        pathValues.push({ path: ["roots", index, "nodes", nodeIndex], value: nodeId });
                      }
                      else {
                        pathValues.push({
                            path: ['roots', index, 'nodes', nodeIndex],
                            value: $ref(['nodesById', nodeId])
                        });
                      }
                    });
                  }
                });
              return pathValues;
          });
  }
});

*/


/*

classEntries.push({
  route: 'roots[{integers:indices}].nodes.length',
  get: function(pathSet) {
    return this.scigraphService.
      getRoots()
        .then(function(roots) {
          var result = pathSet.indices.map(function(index) {
            var list = roots[index];
            // If we determine that there is no genre at the index, we must
            // be specific and return that it is the genre that is not
            // present and not the name of the genre.
            if (list === null) {
                return { path: ["roots", index], value: list };
            }

            return {
                path: ['roots', index, 'nodes', 'length'],
                value: list.nodes.length
            };
          });
          return result;
      });
  }
});



classEntries.push({
  route: 'roots.length',
  get: function(pathSet) {
      return this.scigraphService.getRoots()
          .then(function(roots) {
              return {
                  path: ['roots', 'length'],
                  value: roots.length
              };
          });
  }
});


classEntries.push({
  route: 'roots[{integers:indices}].properties.length',
  get: function(pathSet) {
      return this.scigraphService.
        getRoots().
        then(function(roots) {
          return pathSet.indices.map(function(index) {
            var list = roots[index];
            // If we determine that there is no genre at the index, we must
            // be specific and return that it is the genre that is not
            // present and not the name of the genre.
            if (list === null) {
                return { path: ["roots", index], value: list };
            }

            return {
                path: ['roots', index, 'properties', 'length'],
                value: list.properties.length
            };
          });
        });
  }
});
*/


var MyRouterBase = Router.createClass(classEntries);


function MyRouter(userId, preloadGraph, initializedCb) {
  var that = this;
  MyRouterBase.call(this);
  this.userId = userId;
  this.scigraphService = new SciGraphService(isNodeJS(), userId, preloadGraph,
    function () {
      initializedCb(that);
    });
}
MyRouter.prototype = Object.create(MyRouterBase.prototype);

module.exports = function(userId, preloadGraph, initializedCb) {
    return new MyRouter(userId, preloadGraph, initializedCb);
};
