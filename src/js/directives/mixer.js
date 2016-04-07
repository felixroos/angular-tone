/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').directive('mixer', function() {
    return {
      scope:    {
        ngModel: '=?'
      },
      link:     function(scope) {
        scope.isNumber = function(value) {
          return typeof value === 'number';
        };

        if (typeof scope.ngModel === 'object') {

        } else {
          console.error('ngModel must be object!');
        }
      },
      template: '<div class="tone-mixer"><poti ng-if="isNumber(param)" label="{{key}}" ng-repeat="(key, param) in ngModel" ng-model="param"></poti></div>'
    };
  });
}());