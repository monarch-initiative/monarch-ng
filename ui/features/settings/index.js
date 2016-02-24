import './settings.less';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './settings.routes';
import SettingsController from './settings.controller';
import SettingsModalController from './settingsModal.controller';

export default angular.module('app.settings', [uirouter])
  .config(routing)
  .controller('SettingsController', SettingsController)
  .controller('SettingsModalController', SettingsModalController)
  .name;

