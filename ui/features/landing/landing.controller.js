

/* eslint-disable */


var _ = require('underscore');
var angular = require('angular');

export default class LandingController {
  constructor($rootScope, scigraph, $timeout) {
    var that = this;
    this.name = 'Landing';
    this.title = 'This is my title';
    this.scigraph = scigraph;
    this.$rootScope = $rootScope;
    this.model = null;
    this.neighbors = [];
    var color = {
        'subClassOf':'#FF4646',
        '~subClassOf':'#992A2A',
        'isDefinedBy':'#00FF00',
        '~isDefinedBy':'#005B00',
        'equivalentClass':'#5BCBB6',
        '~equivalentClass':'#2D655B',
        'sameAs':'#774177',
        'subPropertyOf':'#FFC04C',
        '!subPropertyOf':'#A47B30',
        'equivalentProperty':'#6666FF',
        '~equivalentProperty':'#3D3D99',
        'property':'#FF7032',
        '~property':'#CC3D00',
        'type':'#B2FFFF',
        '~type':'#EDD95D',
        'operand':'#000000'};
    var duration = 750;
    var root;
    var currentNode;
    var currentColor;

    var d3 = global.d3;

    var margin = {top: 20, right: 120, bottom: 20, left: 20},
        width = 180,
        height = 800 - margin.top - margin.bottom;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
          return [d.y, d.x];
        });

    var svg = d3.select("#ObOne").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom);

    var graphDraw = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var divScroll = document.getElementById("outerOB");

    // http://wafi.iit.cnr.it/webvis/tmp/dbpedia/realOntology.json

      if (scigraph.model) {
          that.model = scigraph.model;
      }
      else {
          $rootScope.$on('scigraph-service-initialized', function () {
              that.model = scigraph.model;
          });
      }

      this.scigraph.getPartitionedNeighbors('DOID:863').then(
          function (neighbors) {
              that.$rootScope.$apply(function() {
                that.neighbors = neighbors;
                initialize();
              });
          },
          function (z2) {
              console.log('getPartitionedNeighbors ERROR:', z2);
          });

      function initialize(){
          root = that.neighbors;
          root.x0 = height / 2;
          root.y0 = 0;
          root.id = "DOID:863";
          root.lbl = 'Disease of anatomical entity';
          root.depth = 0;

          // Let it know it has children
          root._children = root.subClassOf;
          updateTree(root, null, 0);

          d3.select(self.frameElement).style("height", "800px");
      }

      function sciCall(sciRoot){
        var safeId = sciRoot.id;
        var safeName = sciRoot.lbl;
        var safeDepth = sciRoot.depth;
        that.scigraph.getPartitionedNeighbors(sciRoot.id).then(
            function (neighbors) {
                that.$rootScope.$apply(function() {
                    sciRoot = neighbors;
                    sciRoot.id = safeId;
                    sciRoot.lbl = safeName;
                    sciRoot.depth = safeDepth;
                    sciRoot.children = null;  // sciRoot.subClassOf;
                    moveOn(sciRoot);
                });
            },
            function (z2) {
                console.log('getPartitionedNeighbors ERROR:', z2);
            });
      }

      // Tree layout unable to differentiate between groups of children, so we're passing them in
      function updateTree(source, children, axis) {
          source.children = children;

          // Compute the new tree layout.
          var nodes = tree.nodes(root).reverse(),
              links = tree.links(nodes);

          // Normalize for fixed-depth.
          nodes.forEach(function(d) {
              d.y = d.depth * 200;
          });

          // Update the nodes…
          var node = graphDraw.selectAll("g.node")
              .data(nodes, function(d) {
                return d.id + '.' + d.depth;
              });

          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) {
                  if (d.y + 100 > width) {
                    width = d.y + 200;
                    svg.attr("width", width);
                    divScroll.scrollLeft = divScroll.scrollWidth;
                  }
                  return "translate(" + source.y0 + "," + source.x0 + ")";
              })
              .on("click", nodeClick);

          nodeEnter.append("circle")
              .attr("r", 1e-6)
              .style("fill", function(d) {
                  return d._children ? "lightsteelblue" : "#fff";
              });

          nodeEnter.append("text")
              .attr("x", function(d) {
                return 10;  // (d.children || d._children) ? -10 : 10; })
              })
              .attr("dy", ".35em")
              .attr("text-anchor", function(d) {
                  return "start";   // (d.children || d._children) ? "end" : "start"; })
              })
              .text(function(d) {
                var lbl = d.id + ' ' + d.lbl;
                return lbl.substr(0, 30);
              })
              .style("fill-opacity", 1e-6);

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) {
                  return "translate(" + d.y + "," + d.x + ")";
              });

          nodeUpdate.select("circle")
              .attr("r", 4.5)
              .style("fill", "lightsteelblue");
              //.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          nodeUpdate.select("text")
              .style("fill-opacity", 1);

          // Transition exiting nodes to the parent's new position.
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) {
                  return "translate(" + source.y + "," + source.x + ")";
              })
              .remove();

          nodeExit.select("circle")
              .attr("r", 1e-6);

          nodeExit.select("text")
              .style("fill-opacity", 1e-6);

          // Update the links…
          var link = graphDraw.selectAll("path.link")
              .data(links, function(d) {
                return d.target.id + '.' + d.target.depth;
              });

          link.text(function(d) {
            var lbl = d.id + ' ' + d.lbl;
            return lbl.substr(0, 30);
          });

          // Enter any new links at the parent's previous position.
          link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                  var o = {x: source.x0, y: source.y0};
                  return diagonal({source: o, target: o});
              })
              .style("stroke", function(d){
                  if (!axis) {
                      currentColor = color[d.target.id];
                  }
                  return currentColor;
              });

          // Transition links to their new position.
          link.transition()
              .duration(duration)
              .attr("d", diagonal);

          // Transition exiting nodes to the parent's new position.
          link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                  var o = {x: source.x, y: source.y};
                  return diagonal({source: o, target: o});
              })
              .remove();

          // Stash the old positions for transition.
          nodes.forEach(function(d) {
              d.x0 = d.x;
              d.y0 = d.y;
          });
      }

      function collapse(d) {
          if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
          }
      }


      // Toggle children on click.
      function nodeClick(d) {
          currentNode = d;

          if (d.nodeType > 1) {

              d.parent.children = d.parent[d.id];
              d.parent._children = null;
              currentColor = color[d.id];

              updateTree(d.parent, d.parent.children, 1);
          }
          else if (d.children) {
              d._children = d.children;
              d.children = null;

              updateTree(d, d.children, 0);
          } else {
              sciCall(d);

              updateTree(d, d.children, 0);
          }
      }

      function moveOn(d){

          var axisData = [];

          for (var key in d) {
              if (d.hasOwnProperty(key)) {
                currentNode[key] = d[key];

                if (Array.isArray(d[key])) {
                    var toPush = {
                        "depth": d.depth + 1,
                        "id": key,
                        "lbl": "",
                        "parent": d.lbl,
                        "children": d._children,
                        "nodeType": 2
                    };
                    axisData.push(toPush);
                }
              }
          }

          // d._children = axisData;
          d.children = axisData;
          updateTree(currentNode, axisData, 0);
      }

  }
}

LandingController.$inject = ['$rootScope', 'scigraph', '$timeout'];
