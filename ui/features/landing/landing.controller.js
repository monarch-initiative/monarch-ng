
/* eslint-disable */


var _ = require('underscore');
var angular = require('angular');

export default class LandingController {
  constructor($rootScope, scigraph) {
    var that = this;
    this.name = 'Landing';
    this.title = 'This is my title';
      this.scigraph = scigraph;
      this.$rootScope = $rootScope;
      this.model = null;
      this.neighbors = [];
      var i = 0;
      var duration = 750;
      var root;

    var d3 = global.d3;

    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 960 - margin.right - margin.left,
        height = 800 - margin.top - margin.bottom;



    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
          return [d.y, d.x];
        });

    var svg = d3.select("#ObOne").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // http://wafi.iit.cnr.it/webvis/tmp/dbpedia/realOntology.json

      if (scigraph.model) {
          that.model = scigraph.model;
      }
      else {
          $rootScope.$on('scigraph-service-initialized', function () {
              that.model = scigraph.model;
          });
      }

    var flare = require("json!./realOntology.json");

      this.scigraph.getPartitionedNeighbors('DOID:863').then(
          function (neighbors) {
              that.$rootScope.$apply(function() {
                  that.neighbors = neighbors;
                  console.log(neighbors);
              });
          },
          function (z2) {
              console.log('getPartitionedNeighbors ERROR:', z2);
          },
            initialize());

      function initialize(){
          root = flare;
          root.x0 = height / 2;
          root.y0 = 0;


          root.children.forEach(collapse);
          updateTree(root, 0, 0);

          d3.select(self.frameElement).style("height", "800px");
      }

      function updateTree(source, type, axis) {

          var color = ['#ccc', '#ccc', 'red', 'green'];

          // Compute the new tree layout.
          var nodes = tree.nodes(root).reverse(),
              links = tree.links(nodes);

          // Normalize for fixed-depth.
          nodes.forEach(function(d) { d.y = d.depth * 180; });

          // Update the nodes…
          var node = svg.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
              .on("click", nodeClick);

          nodeEnter.append("circle")
              .attr("r", 1e-6)
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          nodeEnter.append("text")
              .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
              .attr("dy", ".35em")
              .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
              .text(function(d) { return d.name; })
              .style("fill-opacity", 1e-6);

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

          nodeUpdate.select("circle")
              .attr("r", 4.5)
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          nodeUpdate.select("text")
              .style("fill-opacity", 1);

          // Transition exiting nodes to the parent's new position.
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
              .remove();

          nodeExit.select("circle")
              .attr("r", 1e-6);

          nodeExit.select("text")
              .style("fill-opacity", 1e-6);

          // Update the links…
          var link = svg.selectAll("path.link")
              .data(links, function(d) { return d.target.id; });

          // Enter any new links at the parent's previous position.
          link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                  var o = {x: source.x0, y: source.y0};
                  return diagonal({source: o, target: o});
              })
              .style("stroke", function(d){
                  return axis ? color[type] : color[d.target.nodeType - 1];
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
          if(d.nodeType > 1){
              d.parent.children = d._children;
              d.parent._children = null;

              updateTree(d.parent, d.nodeType - 1, 1);

          }
          else if (d.children) {
              d._children = d.children;
              d.children = null;
          } else {
              that.getExpansionData(d);

              //Get list of d attributes, for now 3 presets
              var axisData = [{"name": "is-a", "parent": d.name, "_children": d._children, "nodeType": 2}, {"name": "has-a", "parent": d.name, "_children": d._children, "nodeType": 3}, {"name": "attribute-of", "parent": d.name, "_children": d._children, "nodeType": 4}];

              //d._children = axisData;
              d.children = axisData;

              updateTree(d, 0, 0);
          }
          updateTree(d, 0, 0);
      }
  }

  getExpansionData(d) {
    console.log('getExpansionData', d);
  }
}

LandingController.$inject = ['$rootScope', 'scigraph'];
