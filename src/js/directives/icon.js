/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').directive('toneIcon', function() {
    return {
      restrict: 'A',
      scope:    {
        toneIcon: '@'
      },
      template: '<i class="material-icons tone-icon">{{toneIcon}}</i>'
    };
  });
}());