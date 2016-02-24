var modalTemplateUrl = require('!ngtemplate!html!./settingsModal.tpl.html');

export default class SettingsController {
  constructor($uibModal) {
    this.name = 'Settings';
    this.$uibModal = $uibModal;
  }


  openModal() {
    var that = this;
    var modalInstance = this.$uibModal.open({
      animation: this.animationsEnabled,
      templateUrl: modalTemplateUrl,
      controller: 'SettingsModalController',
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

SettingsController.$inject = ['$uibModal'];
