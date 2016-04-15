/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').directive('poti', function() {
    return {
      scope:    {
        size:      '@?',
        min:       '=?',
        max:       '=?',
        value:     '=?',
        values:    '=?',
        color:     '@?',
        onTrigger: '=?',
        ngModel:   '=?',
        init:      '=?',
        data:      '=?',
        places:    '=?',
        label:     '@?',
        type:      '@?',
        parameter: '@?',
        target:    '=?'

      },
      link:     function(scope) {
        //TODO 360 degree poti for circular values (e.g. offset)
        scope.size = scope.size || 50;
        scope.places = scope.places || 0;
        scope.color = scope.color || '#fff';
        scope.min = scope.min || 0;
        scope.ngModel = scope.ngModel || scope.init || scope.min;

        if (typeof scope.values === 'object' && scope.values.length) {
          scope.max = scope.values.length - 1;
          scope.places = 0;
          scope.value = scope.values[scope.ngModel];
        } else {
          scope.max = scope.max || 100;
          delete scope.values;
        }
        scope.range = scope.max - scope.min;

        scope.style = {
          width:           scope.size + 'px',
          height:          scope.size + 'px',
          borderRadius:    scope.size / 2 + 'px',
          backgroundColor: scope.color
        };

        scope.rotatorStyle = {
          /*
           borderWidth: scope.size / 40 + 'px'*/
        };
        scope.$watch('ngModel', function() {
          if (typeof scope.ngModel === 'number') {
            var deg = (scope.ngModel / scope.max * 270) - 135;
            scope.rotatorStyle.transform = 'rotate(' + deg + 'deg)';

            if (scope.type && scope.parameter && scope.target) {
              var change = {};
              change[scope.type] = {};
              change[scope.type][scope.parameter] = scope.ngModel;
              scope.target.set(change);
            }
          }
        });

        scope.dragging = false;
        scope.startValue = scope.ngModel;
        scope.dragStart = function(data) {
          scope.dragging = true;
          scope.startOffset = data.offsetY;
          scope.startValue = scope.ngModel;
        };
        scope.dragEnd = function(data) {
          scope.dragging = false;
        };
        scope.dragMove = function(data) {
          if (scope.dragging) {
            var delta = scope.startOffset - data.offsetY;
            var placeFactor = Math.pow(10, scope.places);
            var raw = scope.startValue + (delta * scope.range * 1.5 / scope.size);
            raw = Math.round(raw * placeFactor) / placeFactor;
            raw = raw < scope.min ? scope.min : raw;
            raw = raw > scope.max ? scope.max : raw;
            scope.ngModel = raw;
            if (scope.values) {
              scope.value = scope.values[scope.ngModel];
            }
          }
        };

      },
      template: '<div class="tone-poti noselect" ng-style="{width:size+\'px\',height:size+\'px\'}"><div ng-style="style" ng-mousedown="dragStart($event)" ng-mouseup="dragEnd()" ng-mousemove="dragMove($event)" ng-mouseleave="dragEnd()" ng-class="{\'active\':ngModel}" class="poti-container"><div class="poti-rotator" ng-style="rotatorStyle"></div><div class="poti-value">{{value || ngModel}}</div><div class="poti-label">{{label}}</div></div></div>' //
    };
  });
}());