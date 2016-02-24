import about from './index';

describe('Controller: About', function() {
  let $controller;

  beforeEach(angular.mock.module(about));

  beforeEach(angular.mock.inject(function(_$controller_) {
    $controller = _$controller_;
  }));

  it('name is initialized to About', function() {
    let ctrl = $controller('AboutController',
      { $uibModal: {}
      });

    expect(ctrl.name).toBe('About');
  });
});
