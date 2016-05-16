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
    this.d3 = global.d3;
    this.root = null;

    this.color = {
        'subClassOf': '#FF4646',
        '~subClassOf': '#992A2A',
        'isDefinedBy': '#00FF00',
        '~isDefinedBy': '#005B00',
        'equivalentClass': '#5BCBB6',
        '~equivalentClass': '#2D655B',
        'sameAs': '#774177',
        'subPropertyOf': '#FFC04C',
        '!subPropertyOf': '#A47B30',
        'equivalentProperty': '#6666FF',
        '~equivalentProperty': '#3D3D99',
        'property': '#FF7032',
        '~property': '#CC3D00',
        'type': '#B2FFFF',
        '~type': '#EDD95D',
        'operand': '#000000'
    };

    this.duration = 750;
    this.margin = {top: 20, right: 120, bottom: 20, left: 20};
    this.width = 180;
    this.height = 800 - this.margin.top - this.margin.bottom;
    this.tree = null;
    this.currentNode = null;
    this.currentColor = null;

    this.drawBase();
  }


  drawBase() {
    this.tree = this.d3.layout.tree()
        .size([this.height, this.width]);

    this.diagonal = this.d3.svg.diagonal()
        .projection(function(d) {
          return [d.y, d.x];
        });

    this.svg = this.d3.select("#ObOne").append("svg")
        .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.graphDraw = this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

   this.divScroll = document.getElementById("outerOB");

    // http://wafi.iit.cnr.it/webvis/tmp/dbpedia/realOntology.json

    // Deal with both in-browser and in-nodejs initialization of SciGraph
    var that = this;
    if (this.scigraph.model) {
      this.model = this.scigraph.model;
    }
    else {
      this.$rootScope.$on('scigraph-service-initialized', function () {
        that.model = that.scigraph.model;
      });
    }

    this.scigraph.getPartitionedNeighbors('DOID:863').then(
      function (neighbors) {
        that.$rootScope.$apply(function() {
          that.neighbors = neighbors;
          that.initialize();
        });
      },
      function (z2) {
        console.log('getPartitionedNeighbors ERROR:', z2);
      });
  }


  initialize() {
    this.root = this.neighbors;
    this.root.x0 = this.height / 2;
    this.root.y0 = 0;
    this.root.id = "DOID:863";
    this.root.lbl = 'Disease of anatomical entity';
    this.root.depth = 0;

    // Let it know it has children
    this.root._children = this.root.subClassOf;
    this.updateTree(this.root, null, 0);

    this.d3.select(this.frameElement).style("height", "800px");
  }


  sciCall(sciRoot) {
    var that = this;
    var safeId = sciRoot.id;
    var safeName = sciRoot.lbl;
    var safeDepth = sciRoot.depth;
    this.scigraph.getPartitionedNeighbors(sciRoot.id).then(
      function (neighbors) {
        that.$rootScope.$apply(function() {
          sciRoot = neighbors;
          sciRoot.id = safeId;
          sciRoot.lbl = safeName;
          sciRoot.depth = safeDepth;
          sciRoot.children = null;  // sciRoot.subClassOf;
          that.moveOn(sciRoot);
        });
      },
      function (z2) {
        console.log('getPartitionedNeighbors ERROR:', z2);
      });
  }


  // Tree layout unable to differentiate between groups of children, so we're passing them in
  updateTree(source, children, axis) {
    var that = this;
    if (children) {
      children.sort( function(a, b) {
        a = a.id;
        b = b.id;
        if (a < b) {
          return -1;
        }
        else if (a > b) {
          return 1;
        }
        else {
          return 0;
        }
      });
    }
    source.children = children;

    // Compute the new tree layout.
    var nodes = this.tree.nodes(this.root).reverse();

    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
      d.y = d.depth * 200;
    });

    // Update the nodes…
    var node = this.graphDraw.selectAll("g.node")
        .data(nodes, function(d) {
          return d.id + '.' + d.depth;
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            if (d.y + 100 > that.width) {
              that.width = d.y + 200;
              that.svg.attr("width", that.width);
              that.divScroll.scrollLeft = that.divScroll.scrollWidth;
            }
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", function (d) {
            that.nodeClick(d);
        });

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
        .duration(this.duration)
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", "lightsteelblue");
        // .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(this.duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links
    var links = this.tree.links(nodes);

    var link = this.graphDraw.selectAll("path.link")
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
            return that.diagonal({source: o, target: o});
        })
        .style("stroke", function(d) {
            if (!axis) {
                that.currentColor = that.color[d.target.id];
            }
            return that.currentColor;
        });

    // Transition links to their new position.
    link.transition()
        .duration(that.duration)
        .attr("d", that.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(that.duration)
        .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return that.diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }


  collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(this.collapse);
      d.children = null;
    }
  }


  // Toggle children on click.
  nodeClick(d) {
    this.currentNode = d;

    if (d.nodeType > 1) {
      if (d.children) {
        d.parent._children = d.children;
        d.parent.children = null;
        this.updateTree(d.parent, d.parent.children, 1);
      }
      else {
        d.parent.children = [d];
        d.children = d.parent[d.id];
        d._children = null;
        this.currentColor = this.color[d.id];

        this.updateTree(d, d.children, 1);
      }
    }
    else if (d.children) {
      d._children = d.children;
      d.children = null;

      this.updateTree(d, d.children, 0);
    }
    else {
      this.sciCall(d);

      this.updateTree(d, d.children, 0);
    }
  }


  moveOn(d) {
    var axisData = [];

    var sortedKeys = Object.keys(d).sort();
    for (var key in sortedKeys) {
      key = sortedKeys[key];
      if (d.hasOwnProperty(key)) {
        this.currentNode[key] = d[key];

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
    this.updateTree(this.currentNode, axisData, 0);
  }
}


LandingController.$inject = ['$rootScope', 'scigraph', '$timeout'];
