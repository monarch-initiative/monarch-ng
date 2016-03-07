import WebPhenoteModule from './index';

describe('Controller: WebPhenoteModule.WebPhenoteController', function() {
  let $controller;
  let scope;

  beforeEach(angular.mock.module('app.webphenote'));

  beforeEach(angular.mock.inject(function($rootScope, _$controller_) {
    $controller = _$controller_;
    scope = $rootScope.$new();
  }));

  it('name is initialized to webphenote', function() {
    let ctrl = $controller('WebPhenoteController', {$scope: scope});
    expect(ctrl.name).toBe('webphenote');
  });
});
