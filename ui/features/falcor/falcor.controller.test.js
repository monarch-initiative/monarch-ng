import falcor from './index';

describe('Controller: Falcor', function() {
  let $controller;
  let scope;
  let httpBackend;
  let http;
  let timeout;
  let log;

  beforeEach(angular.mock.module(falcor));

  beforeEach(angular.mock.inject(function($rootScope, $timeout, $log, $http, $httpBackend, _$controller_) {
    $controller = _$controller_;
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    http = $http;
    timeout = $timeout;
    log = $log;
  }));

  it('name is initialized to Falcor', function() {
    let ctrl = $controller('FalcorController',
      { $scope: scope,
        $http: http,
        $uibModal: {},
        $log: log,
        $timeout: timeout
      });

    expect(ctrl.name).toBe('Falcor');
  });
});
