import angular from 'angular';

function scroll($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      scope.$watchCollection(attr.scroll, function(newVal) {
        $timeout(function() {
         element[0].scrollTop = element[0].scrollHeight;
        });
      });
    }
  };
}

export default angular.module('directives.scroll', [])
  .directive('scroll', scroll)
  .name;
