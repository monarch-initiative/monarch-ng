var angular = require('angular');

export default class WebPhenoteStepIsolatedController {
  constructor($scope, multiStepFormScope, multiStepFormInstance) {
    this.model = angular.copy(multiStepFormScope.stepcontainer.model);
    var that = this;

    $scope.$on('$destroy', function () {
      multiStepFormScope.stepcontainer.model = angular.copy(that.model);
    });
  }
}

WebPhenoteStepIsolatedController.$inject = ['$scope', 'multiStepFormScope', 'multiStepFormInstance'];
