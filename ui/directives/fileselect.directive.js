import angular from 'angular';

function ngFileSelect($timeout) {
    return {
        scope: {
          change: '&'
        },
        link: function (scope, element, attrs) {
            element.on('change', function(ev) {
              scope.change({event: ev});
            });
        }

    };
}

export default angular.module('directives.ngfileselect', [])
  .directive('ngfileselect', ngFileSelect)
  .name;
