import d3 from './index';

describe('Controller: D3', function() {
  let $controller;
  let scope;

  beforeEach(angular.mock.module(d3));

  beforeEach(angular.mock.inject(function($rootScope, _$controller_) {
    $controller = _$controller_;
    scope = $rootScope.$new();
  }));

  it('name is initialized to D3', function() {
    let ctrl = $controller('D3Controller', {$scope: scope});
    expect(ctrl.name).toBe('D3');
  });
});
