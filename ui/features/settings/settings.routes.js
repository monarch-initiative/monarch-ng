var settingsTpl = require('./settings.html');

export default function routes($stateProvider) {
  $stateProvider
    .state('settings', {
      url: '/settings',
      templateUrl: settingsTpl,
      controller: 'SettingsController',
      controllerAs: 'settings'
    });
}

routes.$inject = ['$stateProvider'];
