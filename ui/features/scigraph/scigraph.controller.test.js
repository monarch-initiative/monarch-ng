import scigraph from './index';

describe('Controller: SciGraph', function() {
  let $controller;
  let scope;
  let httpBackend;
  let http;
  let timeout;
  let log;

  console.log('scigraph:', scigraph);
  beforeEach(angular.mock.module(scigraph));

  beforeEach(angular.mock.inject(function($rootScope, $timeout, $log, $http, $httpBackend, _$controller_) {
    $controller = _$controller_;
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    http = $http;
    timeout = $timeout;
    log = $log;
  }));

  it('name is initialized to SciGraph', function() {
    let ctrl = $controller('SciGraphController',
      { $scope: scope,
        $http: http,
        $uibModal: {},
        $log: log,
        $timeout: timeout
      });

    expect(ctrl.name).toBe('SciGraph');
  });
});
