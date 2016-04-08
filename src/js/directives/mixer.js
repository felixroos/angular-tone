/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').directive('mixer', function($log) {
    return {
      scope:    {
        ngModel: '=?'
      },
      link:     function(scope) {
        scope.isNumber = function(value) {
          return typeof value === 'number';
        };
        scope.loading = true;
        scope.$watch('ngModel', function() {
          if (typeof scope.ngModel === 'object') {
            scope.loading = false;
            $log.debug('link mixer for object ', scope.ngModel);
          }
        });
      },
      template: '<div class="tone-mixer" ng-if="!loading"><poti ng-if="isNumber(param)" label="{{key}}" ng-repeat="(key, param) in ngModel" ng-model="param"></poti></div>'
    };
  });
}());