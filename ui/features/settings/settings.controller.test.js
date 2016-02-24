import settings from './index';

describe('Controller: Settings', function() {
  let $controller;

  beforeEach(angular.mock.module(settings));

  beforeEach(angular.mock.inject(function(_$controller_) {
    $controller = _$controller_;
  }));

  it('name is initialized to Settings', function() {
    let ctrl = $controller('SettingsController',
      { $uibModal: {}
      });

    expect(ctrl.name).toBe('Settings');
  });
});
