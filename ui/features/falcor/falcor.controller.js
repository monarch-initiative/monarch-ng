var _ = require('underscore');
var angular = require('angular');
import falcor from 'falcor';

export default class FalcorController {
  constructor($http, $log, $timeout, $rootScope, $state, netflix) {
    var that = this;
    this.name = 'Falcor';
    this.$http = $http;
    this.$log = $log;
    this.client = null;
    this.$rootScope = $rootScope;
    this.netflix = netflix;
    this.falcorLog = {};
    this.pendingMessage = '';


    // var ouchDBSource = new OuchDBSource('label');
    // ouchDBSource.test('foo');

    // var model = new falcor.Model({
    //     source: ouchDBSource
    // });
    // model.get('genrelist[0].titles.length').subscribe(
    //   function(z) {
    //     console.log('###model.get: ', z);
    //   },
    //   function(err) {
    //     console.log('###model.get err: ', err);
    //   });
  }

  ident(foo) {
    console.log('falcor ident:', foo);
    return foo;
  }

  falcorTest(whichLog, whichTest) {
    var that = this;
    this.falcorLog[whichLog] = [];  // this.falcorLog[whichLog] || [];

  // <script src="//netflix.github.io/falcor/build/falcor.browser.js"></script>

    var model = this.netflix.model;

    function log(logType, msg) {
      logType = logType || '';
      console.log('[' + logType + ']', msg);
      that.falcorLog[whichLog].push(msg);
    }

    function nglog(x) {
      that.$rootScope.$evalAsync(function() {
        log('LOG', x);
      });
    }
    function ngerror(x) {
      that.$rootScope.$evalAsync(function() {
        log('ERR', x);
      });
    }

    if (whichTest === 'lastTitle') {
        nglog('genrelist[0].titles.length');
        model.get('genrelist[0].titles.length').then(
          function(z) {
            that.$rootScope.$apply(
              function () {
                nglog(z);
                var index = z.json.genrelist[0].titles.length - 1;
                nglog('genrelist[0].titles[' + index + ']["name", "year"]');
                model.get('genrelist[0].titles[' + index + ']["name", "year"]').then(
                    function (z1) {
                      nglog(z1);
                    },
                    function (z2) {
                        console.log('Expected error for:',
                            'genrelist[0].titles[' + index + ']["name", "year"]',
                            z2);
                    });
              });
          },
          ngerror);
    }

    if (whichTest === 'addTitle') {
        nglog('genrelist[0].titles.length');
        model.get('genrelist[0].titles.length')
          .then(
            function(z) {
              that.$rootScope.$apply(function () {
                log('genrelist[0].titles.length', z);

                nglog('genrelist[0].titles.push');
                nglog([{$type: "ref", value: ['titlesById', 3]}]);
                model.call(
                    'genrelist[0].titles.push',
                    [{$type: "ref", value: ['titlesById', 3]}], ["name", "rating"], ["length"])
                  .then(
                    function(x) {
                      log('genrelist[0].titles.push', x);
                      var index = x.json.genrelist[0].titles.length - 1;
                      model.get('genrelist[0].titles[' + index + ']["name", "year"]').then(
                          function (z1) {
                            nglog(z1);
                          },
                          function (z2) {
                              log('Error for: genrelist[0].titles[' + index + ']["name", "year"]',
                                  z2);
                          });
                    },
                    ngerror);
              });
            },
            ngerror);
    }


    if (whichTest === 'removeTitle') {
        nglog('genrelist[0].titles.length');
        model.get('genrelist[0].titles.length').then(
          function(x) {
            that.$rootScope.$apply(function () {
              nglog(x);
              var index = x.json.genrelist[0].titles.length - 1;
              nglog('genrelist[0].titles.remove');
              model.call('genrelist[0].titles.remove', [index]).then(
                function(y) {
                  nglog(y);
                  nglog('genrelist[0].titles[' + (index - 1) + ']["name", "year"]');
                  model.get('genrelist[0].titles[' + (index - 1) + ']["name", "year"]').then(
                      function (z1) {
                        nglog(z1);
                      },
                      function (z2) {
                        nglog(z2);
                      });
                },
                ngerror);
            });
          },
          ngerror);
    }

    if (whichTest === 'addRemove') {
        nglog('genrelist[0].titles.length');
        model.get('genrelist[0].titles.length').then(
          function(z) {
            that.$rootScope.$apply(function () {
              nglog(z);
              nglog('genrelist[0].titles.push');
              model.call('genrelist[0].titles.push', [{$type: "ref", value: ['titlesById', 1]}], ["name", "rating"], ["length"]).then(
                function(x) {
                  nglog(x);
                  var index = x.json.genrelist[0].titles.length - 1;
                  log(index);
                  nglog('genrelist[0].titles.remove');
                  model.call('genrelist[0].titles.remove', [index]).then(
                    function(y) {
                      log('---');
                      nglog(y);
                      try {
                          model.get('genrelist[0].titles[' + (index + 1) + ']["name", "year"]').then(
                              function (z1) {
                                  console.log('Unexpected success for:',
                                      'genrelist[0].titles[' + (index + 1) + ']["name", "year"]',
                                      z1);
                              },
                              function (z2) {
                                  console.log('Expected error for:',
                                      'genrelist[0].titles[' + (index + 1) + ']["name", "year"]',
                                      z2);
                              });
                      }
                      catch (e) {
                          console.log('Expected exception for:',
                          'genrelist[0].titles[' + (index + 1) + ']["name", "year"]',
                          e);
                      }
                    },
                    ngerror);
                },
                ngerror);
            });
          },
          ngerror);
    }

    function modelGet(path) {
      nglog(path);
      return model.get(path);
    }
    function modelSetValue(path, val) {
      nglog(path);
      nglog(val);
      return model.setValue(path, val);
    }
    if (whichTest === 'default') {
        modelGet('genrelist[0].name').then(nglog, ngerror);
        modelGet('titlesById[-1]["userRating", "name"]').then(nglog, ngerror);
        modelSetValue('titlesById[9].userRating', 9).then(nglog, ngerror);
        modelSetValue('genrelist[0].titles[2].userRating', 3).then(nglog, ngerror);
        modelGet('genrelist[0].titles[0..2]["userRating", "name"]').then(function(x) {
            nglog(x);
            modelSetValue('genrelist[0].titles[1].userRating', 8).then(function(y) {
                nglog(y);
                modelGet('genrelist[0].titles[0..2]["userRating", "name"]').then(nglog, ngerror);
            }, ngerror);
        }, ngerror);
        modelGet('titlesById[26,5,4].userRating').then(nglog, ngerror);
        modelGet('titlesById[3,4,5]["name", "year", "description"]').then(nglog, ngerror);
        modelGet('genrelist[0].titles.length').then(nglog, ngerror);
        modelGet('genrelist[0].titles[0..10]["name", "year", "boxshot"]').then(nglog, ngerror);
        modelGet('genrelist[0].titles[0]').subscribe(nglog, ngerror);
        modelGet('genrelist.length').then(nglog, ngerror);
        modelGet('genrelist[0].titles.length').then(function(z) {
            nglog(z);
            model.call('genrelist[0].titles.push', [{$type: "ref", value: ['titlesById', 1]}], ["name", "rating"], ["length"]).then(function(x) {
                log('genrelist[0].titles.push x', x);
                var index = x.json.genrelist[0].titles.length - 1;
                log('genrelist[0].titles.push index', index);
                model.call('genrelist[0].titles.remove', [index]).then(function(y) {
                    log('genrelist[0].titles.remove', y);
                    modelGet('genrelist[0].titles[' + (index - 1) + ']["name", "year"]').then(nglog, ngerror);
                }, ngerror);
            }, ngerror);
        }, ngerror);
        modelSetValue('titlesById[0].userRating', 4).then(nglog, ngerror);// this is expected to fail
        modelGet('titlesById[1]["userRating", "rating"]').then(nglog, ngerror);
        modelGet('titlesById[0, 1, 2, 3]["year", "rating", "userRating"]').then(nglog, ngerror);
        modelGet('titlesById[1234].userRating').then(nglog, ngerror);
    }
  }
}

FalcorController.$inject = ['$http', '$log', '$timeout', '$rootScope', '$state', 'netflix'];
