var modalTemplateUrl = require('!ngtemplate!html!./aboutModal.tpl.html');

export default class AboutController {
  constructor($uibModal) {
    this.name = 'About';
    this.$uibModal = $uibModal;
  }

  openModal() {
    var that = this;
    var modalInstance = this.$uibModal.open({
      animation: this.animationsEnabled,
      templateUrl: modalTemplateUrl,
      controller: 'AboutModalController',
      controllerAs: 'LM',
      resolve: {
        modalInfo: function () {
          return that.modalInfo;
        }
      }
    });

    modalInstance.result.then(function (modalInfo) {
      that.modalInfo = modalInfo;
    }, function () {
      that.$log.info('Modal dismissed at: ' + new Date());
    });
  }
}

AboutController.$inject = ['$uibModal'];
