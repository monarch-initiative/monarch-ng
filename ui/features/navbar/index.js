import NavbarController from './navbar.controller';
import ng from 'angular';

export default ng.module('app.navbar', [])
  .controller('NavbarController', NavbarController)
  .name;
