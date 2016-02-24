import landing from './index';

describe('Controller: Landing', function() {
  let $controller;

  beforeEach(angular.mock.module(landing));

  beforeEach(angular.mock.inject(function(_$controller_) {
    $controller = _$controller_;
  }));


  it('name is initialized to Landing', function() {
    let ctrl = $controller('LandingController',
      {});


    expect(ctrl.name).toBe('Landing');
  });
});
