export default class NavbarController {
  constructor($location) {
    this.$location = $location;
    this.collapsed = true;
  }

  isActive(viewLocation) {
    return ('/' + viewLocation) === this.$location.path();
  }
}

NavbarController.$inject = ['$location'];
