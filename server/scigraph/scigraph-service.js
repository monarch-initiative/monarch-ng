var _ = require('underscore');
// var Promise = require('promise');
var path = require('path');

var scigraphURL = 'https://scigraph-ontology.monarchinitiative.org';
var sgRelationshipTypesPath = '/scigraph/graph/relationship_types';
var sgPropertiesPath = '/scigraph/graph/properties';
var sgEdgesPath = '/scigraph/graph/edges';
var sgNeighborsPath = '/scigraph/graph/neighbors';
var sgRelationshipTypesURL = scigraphURL + sgRelationshipTypesPath;

// var Wreck = require('wreck');
var Axios = require('axios');
var axios = Axios.create({
  baseURL: scigraphURL,
  timeout: 10000,
  headers: {}
});

var batch = require('./batch');

function captureStackTrace(error, ctor) {
  var container = new Error();
  console.log('CST error:', error);
  console.log('CST ctor:', ctor);
  Object.defineProperty(error, 'stack', {
    configurable: true,
    get: function getStack() {
      var stack = container.stack;

      Object.defineProperty(this, 'stack', {
        value: stack
      });

      console.log('###stack:', stack);
      return stack;
    }
  });

  console.log('###error:', error);
}


// SciGraph service
function SciGraphService(isNodeJS, userId, preloadGraph, initializedUserCb) {
  var that = this;

  initializedUserCb();
}


function joinNodes(edges, nodes) {
  var nodeMap = {};
  _.each(nodes, function (node) {
    nodeMap[node.id] = node;
  });

  var result = [];
  var resultMap = {};
  _.each(edges, function (edge) {
    var edgeKey = edge.sub + '/' + edge.pred + '/' + edge.obj;
    if (resultMap[edgeKey]) {
      // console.log('DUP:', edge);
    }
    else {
      resultMap[edgeKey] = true;
      result.push({
        sub: nodeMap[edge.sub],
        obj: nodeMap[edge.obj],
        pred: edge.pred
      });
    }
  });

  // console.log('join:', result);
  return result;
}


SciGraphService.prototype = {
  getRelationshipTypes: function() {
    var result = new Promise(
      // The resolver function is called with the ability to resolve or
      // reject the promise
      function(resolve, reject) {

        // Make a request for a user with a given ID
        axios.get(sgRelationshipTypesPath)
          .then(function (response) {
            resolve(response.data);
          })
          .catch(function (response) {
            console.log('axios NO:', response);
            reject(response);
          });
      });

    return result;
  },

  getProperties: function() {
    var result = new Promise(
      // The resolver function is called with the ability to resolve or
      // reject the promise
      function(resolve, reject) {

        // Make a request for a user with a given ID
        axios.get(sgPropertiesPath)
          .then(function (response) {
            resolve(response.data);
          })
          .catch(function (response) {
            console.log('axios NO:', response);
            reject(response);
          });
      });

    return result;
  },

  getEdges: function(edgeTypes) {
    var that = this;
    var result = new Promise(
      // The resolver function is called with the ability to resolve or
      // reject the promise
      function(resolve, reject) {
        console.log('edgeTypes', edgeTypes);
        var resultEdges = {};
        var getters = [];
        var getterKeys = [];
        _.each(edgeTypes, function(edgeType) {
          var edgePath = sgEdgesPath + '/' + edgeType;
          function getter() {
            return axios.get(
              edgePath,
              {
                params:
                {
                  limit: 100,
                  skip: 0,
                  entail: false
                }
              });
              // .then(function (response) {
              //   var edges = response.data.edges;
              //   console.log('axios YES:', edges);
              //   resultEdges[edgeType] = edges;

              //   console.log('resolve resultEdges', resultEdges);
              //   resolve(resultEdges);
              // })
              // .catch(function (response) {
              //   console.log('axios NO:', response);
              //   // reject(response);
              // });
          }
          getters.push(getter());
          getterKeys.push(edgeType);
      });

      Axios.all(getters)
      .then(Axios.spread(function() {
        console.log('####arguments:', arguments);
        var xresult = {};
        xresult[getterKeys[0]] = arguments[0].data.edges;
        xresult[getterKeys[1]] = arguments[1].data.edges;
        resolve(xresult);
      }));
    });

    return result;
  },



  getNeighbors: function(ids, relationshipType, direction) {
    var that = this;
    var result = new Promise(
      // The resolver function is called with the ability to resolve or
      // reject the promise
      function(resolve, reject) {
        var resultEdges = {};
        var getters = [];
        var getterKeys = [];
        _.each(ids, function(id) {
          var escapedId = encodeURIComponent(id);
          var neighborsPath = sgNeighborsPath + '/' + escapedId;

          function getter() {
            return axios.get(
              neighborsPath,
              {
                params:
                {
                  depth: 1,
                  blankNodes: false,
                  direction: direction,
                  relationshipType: relationshipType,
                  project: '*'
                }
              });
          }
          getters.push(getter());
          getterKeys.push(ids);
      });

      Axios.all(getters)
      .then(Axios.spread(function() {
        var xresult = {};
        var nodes = arguments[0].data.nodes;
        var edges = arguments[0].data.edges;
        var mergedEdges = joinNodes(edges, nodes);

        xresult[getterKeys[0]] = mergedEdges;
        resolve(xresult);
      }));
    });

    return result;
  },



  getNodes: function(whichNodeIds) {
              var result = whichNodeIds.map(
                              function(x) {
                                return {id: x};
                            });
              return Promise.resolve(result);
            },

  getRoot: function(rootId) {
    var roots = [];
    roots.push({id: rootId});
    return Promise.resolve(roots);
  },

  getRoots: function() {
    var roots = [];
    var props = [{author: 'AUTHOR', title: 'TITLE'}];
    roots.push({id: 'FIRST', title: 'FIRST', properties: props});
    return Promise.resolve(roots);
  }
};


module.exports = SciGraphService;

