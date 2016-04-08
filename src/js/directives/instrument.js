/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').directive('instrument', function($log, Instruments) {
    return {
      restrict: 'E',
      scope:    {
        id:      '@',
        ngModel: '=?',
        type:    '@',
        config:  '=?'
      },
      link:     function(scope) {
        $log.debug('link instrument "' + scope.id + '" of type ' + scope.type + '" with config ', scope.config);
        scope.ngModel = Instruments.add(scope.id, scope.type, scope.config || {});
      }
    };
  });
}());