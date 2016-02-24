var angular = require('angular');
var _ = require('underscore');

export default class AboutModalController {
  constructor($http, $uibModalInstance, modalInfo) {
    this.$http = $http;
    this.$uibModalInstance = $uibModalInstance;

    this.originalmodalInfo = {};
    angular.copy(modalInfo, this.originalmodalInfo);
    this.modalInfo = {};

    this.reset();
  }

  reset() {
    angular.copy(this.originalmodalInfo, this.modalInfo);
  }

  ok() {
    this.$uibModalInstance.close(this.modalInfo);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }
}

AboutModalController.$inject = ['$http', '$uibModalInstance', 'modalInfo'];
