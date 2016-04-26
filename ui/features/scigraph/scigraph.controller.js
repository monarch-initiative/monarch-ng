var _ = require('underscore');
var angular = require('angular');

export default class SciGraphController {
  constructor($http, $log, $timeout, $rootScope, scigraph) {
    var that = this;
    this.name = 'SciGraph';
    this.showAdvanced = false;
    this.$http = $http;
    this.client = null;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.$log = $log;
    this.logs = {};
    this.scigraph = scigraph;
    this.model = null;
    this.rootIndex = 0;
    this.neighborsStart = '';
    this.neighbors = [];
    this.properties = [];
    this.relationshipTypes = {};

    var d3 = global.d3;

    d3.select("body svg#d3svg").remove();


    function startAfterSciGraphService() {
      $timeout(function() {
        console.log('SciGraph initialized');
        // that.getRelationshipTypes();
      }, 200);
    }

    if (scigraph.model) {
      that.model = scigraph.model;
      startAfterSciGraphService();
    }
    else {
      $rootScope.$on('scigraph-service-initialized', function () {
        that.model = scigraph.model;
        startAfterSciGraphService();
      });
    }
  }

  log(msg) {
    console.log('LOG:', msg);
    this.logs.default = this.logs.default || [];
    this.logs.default.push(msg);
  }

  error(msg) {
    console.log('ERROR:', msg);
    this.logs.default = this.logs.default || [];
    this.logs.default.push(msg);
  }

  ident(foo) {
    console.log('scigraph ident:', foo);
    return foo;
  }


  getProperties() {
    var that = this;
    var model = this.model;

    this.logs.default = [];
    var propertiesPath = 'properties';
    that.log(propertiesPath);
    model.get(propertiesPath).then(function(properties) {
      that.$rootScope.$apply(function () {
        if (properties) {
          angular.copy(properties.json.properties, that.properties);
          that.log(that.properties);
        }
        else {
          that.properties = [];
        }
      });
    },
    that.error);
  }

  getRelationshipTypes() {
    var that = this;
    var model = this.model;

    this.logs.default = [];
    var relationshipTypesPath = 'relationshipTypes';
    that.log(relationshipTypesPath);
    model.get(relationshipTypesPath).then(function(relationshipTypes) {
      var refinedRelationshipTypes = {};
      _.each(relationshipTypes.json.relationshipTypes,
        function(t) {
          refinedRelationshipTypes[t] = {
            name: t,
            count: 0
          };
        });

      that.$rootScope.$apply(function () {
        if (relationshipTypes) {
          angular.copy(refinedRelationshipTypes, that.relationshipTypes);
          that.log(that.relationshipTypes);
        }
        else {
          angular.copy({}, that.relationshipTypes);
        }
      });
    },
    that.error);
  }


  computeEdgeCounts() {
    var that = this;
    this.logs.default = [];
    var edgesPath = 'edges["isDefinedBy", "equivalentClass"].length';
    that.log(edgesPath);
    this.model.get(edgesPath).then(function(edgesResponse) {
      console.log('edgesResponse:', edgesResponse);
      that.$rootScope.$apply(function () {
        that.relationshipTypes.isDefinedBy = {
          count: edgesResponse.json.edges.isDefinedBy.length
        };
        that.relationshipTypes.equivalentClass = {
          count: edgesResponse.json.edges.equivalentClass.length
        };

        that.log(edgesResponse.json.edges);
        console.log('that.relationshipTypes', that.relationshipTypes);
      });
    },
    that.error);
  }


  subclassOfOld(id) {
    var that = this;
    this.logs.default = [];
    var neighborsLengthPath = 'nodes["' + id + '"]neighbors.length';
    that.log(neighborsLengthPath);
    this.model.get(neighborsLengthPath).then(function(neighborsResponse) {
      var len = neighborsResponse.json.nodes[id].neighbors.length;
      that.log(neighborsResponse.json);

      var neighborsPath = 'nodes["' + id + '"].neighbors[0..' + (len - 1) + ']["sub", "obj", "pred", "meta"]';
      that.log(neighborsPath);
      that.model.get(neighborsPath).then(
        function (z1) {
          var partitionedNeighbors = that.scigraph.partitionNeighbors(z1);
          that.$rootScope.$apply(function () {
            that.log(z1);
            if (z1) {
              that.neighbors = z1.json.nodes[id].neighbors;
              that.log(that.neighbors);
            }
            else {
              that.rootObjects = [];
            }
          });
        },
        function (z2) {
          console.log('listNodesForRoot error for:',
            neighborsPath,
            z2);
        });
    },
    that.error);
  }


  getNeighbors(id) {
    var that = this;
    this.logs.default = [];
    this.scigraph.getPartitionedNeighbors(id).then(
      function (neighbors) {
        that.$rootScope.$apply(function() {
          that.neighborsStart = id;
          that.neighbors = neighbors;
        });
      },
      function (z2) {
        console.log('getPartitionedNeighbors ERROR:', z2);
      });
  }


  listNodesForRoot() {
    var that = this;
    var model = this.model;
    var rootIndex = this.rootIndex;

    this.messageMode = false;

    this.logs.default = [];
    var rootNodesLengthPath = 'roots[' + rootIndex + '].nodes.length';
    that.log(rootNodesLengthPath);
    model.get(rootNodesLengthPath).then(function(zz) {
      var nNodes = zz.json.roots[rootIndex].nodes.length;
      var rootNodesPath = 'roots[' + rootIndex + '].nodes[0..' + (nNodes - 1) + '].["author", "title", "text", "nodeId"]';
      that.log(rootNodesPath);
      model.get(rootNodesPath).then(
        function (z1) {
          that.$rootScope.$apply(function () {
            that.log(z1);
            if (z1) {
              that.rootObjects = z1.json.roots[rootIndex].nodes;
              that.log(that.rootObjects);
            }
            else {
              that.rootObjects = [];
            }
          });
        },
        function (z2) {
          console.log('listNodesForRoot error for:',
            rootNodesPath,
            z2);
        });
    },
    that.error);
  }

  listProperties() {
    var rootIndex = this.rootIndex;
    var that = this;
    var model = this.model;
    console.log('model:', model);

    this.logs.default = [];
    this.messageMode = true;

    var rootTitlePath = 'roots[' + rootIndex + '].title';
    that.log(rootTitlePath);
    model.get(rootTitlePath).then(function(z) {
      var rootTitle = z.json.roots[rootIndex].title;

      var rootPropertiesLengthPath = 'roots[' + rootIndex + '].properties.length';
      that.log(rootPropertiesLengthPath);
      model.get(rootPropertiesLengthPath).then(function(zz) {
        var nMsgs = zz.json.roots[rootIndex].properties.length;

        if (nMsgs > 0) {
          var rootPropertiesPath = 'roots[' + rootIndex + '].properties[0..' + (nMsgs - 1) + ']["author", "text"]';

          that.log(rootPropertiesPath);
          model.get(rootPropertiesPath).then(
            function (z1) {
              that.$rootScope.$apply(function () {
                that.rootObjects = z1.json.roots[rootIndex].properties;
                that.log(that.rootObjects);
              });
            },
            function (z2) {
              console.log('listProperties error for:',
                rootPropertiesPath,
                z2);
            });
        }
        else {
          that.$rootScope.$apply(function () {
            that.rootObjects = [];
          });
        }
      }, that.error);
    }, that.error);
  }

  addProperty(message) {
    var rootIndex = this.rootIndex;
    var that = this;
    var model = this.model;

    this.logs.default = [];
    if (this.messageMode) {
      var rootPropertiesLengthPath = 'roots[' + rootIndex + '].properties.length';
      that.log(rootPropertiesLengthPath);
      model.get(rootPropertiesLengthPath).then(
        function(z) {
          var msgText = message || 'NO MSG TEXT';
          var newMsg = {author: 'Bud', text: msgText};

          var rootPropertiesPushPath = 'roots[' + rootIndex + '].properties.push';
          that.log(rootPropertiesPushPath);
          that.log([newMsg]);
          model.call(rootPropertiesPushPath, [newMsg])
            .then(
              function(x) {
                console.log('addProperty:', x);
                that.pendingObjectText = '';
                that.debounceRows = 1;
                that.listProperties();
              },
              function(x) {
                that.log('Failed ' + rootPropertiesPushPath, x);
              });
        },
        that.error);
    }
    else {
      var rootNodesLengthPath = 'roots[' + rootIndex + '].nodes.length';
      that.log(rootNodesLengthPath);
      model.get(rootNodesLengthPath).then(
        function(z) {
          var nodeText = message || 'NO MSG TEXT';
          var nodeId = 'NodeID_' + Date.now();
          var nodesToAdd = [{
                          _id: nodeId,
                          author: 'Bud',
                          text: nodeText
                        }];

          var rootNodesPushPath = 'roots[' + rootIndex + '].nodes.pushVal';
          that.log(rootNodesPushPath);
          that.log(nodesToAdd);
          model.call(rootNodesPushPath, nodesToAdd)
            .then(
              function(x) {
                that.debounceRows = 1;
                that.pendingObjectText = '';
                that.listNodesForRoot();
              },
              function(x) {
                that.log('Failed ' + rootNodesPushPath, x);
              });
        },
        that.error);
    }
  }


  updatePropertyOrNode(message) {
    this.logs.default = [];
    var that = this;
    var model = this.model;

    if (this.messageMode) {
        // NYI
    }
    else {
      var getPath = 'nodesById["' + message.nodeId + '"].["text","author","nodeId"]';
      that.log(getPath);
      model.get(getPath).then(
        function(z) {
          console.log('getPath returns:', z);
          var setPath = 'nodesById["' + message.nodeId + '"].text';
          console.log('setPath:', setPath);
          that.log(setPath);
          that.log(message.text);
          model.setValue(setPath, message.text)
            .then(
              function(x) {
                message.isEditing = false;
                message.debounceRows = 1;
                that.listNodesForRoot();
              },
              function(x) {
                that.log('Failed setPath:', x);
                // that.listNodesForRoot();
              });
        },
        that.error);
    }
  }

  deletePropertyOrNode(message, indexInRoot) {
    var rootIndex = this.rootIndex;
    this.logs.default = [];
    var that = this;
    var model = this.model;

    console.log('deletePropertyOrNode: ', message, indexInRoot);
    if (this.messageMode) {
      //
    }
    else {
      var index = indexInRoot;

      var rootNodesRemovePath = 'roots[' + rootIndex + '].nodes.remove';
      that.log(rootNodesRemovePath);
      that.log([index]);
      model.call(rootNodesRemovePath, [index]).then(
        function(y) {
          that.log(rootNodesRemovePath, y);
          that.listNodesForRoot();
        },
        that.error);
    }
  }


  editPropertyOrNode(message, indexInRoot) {
    var that = this;
    var model = this.model;

    console.log('editPropertyOrNode: ', message, indexInRoot);
    if (this.messageMode) {
      //
    }
    else {
      message.debounceRows = 1;
      message.isEditing = true;
      var index = indexInRoot;
    }
  }


  cancelEdit(message) {
    var that = this;
    message.isEditing = false;
    that.pendingObject = null;
    that.pendingObjectText = '';
    that.pendingObjectEditing = null;
    // that.listNodesForRoot();
  }

  guessRows(val, counterLocation) {
    var result = val.split('\n').length + 1;
    counterLocation = counterLocation || this;
    if (result > counterLocation.debounceRows) {
      counterLocation.debounceRows = result;
    }
    else {
      result = counterLocation.debounceRows;
    }

    return result;
  }
}

SciGraphController.$inject = ['$http', '$log', '$timeout', '$rootScope', 'scigraph'];
