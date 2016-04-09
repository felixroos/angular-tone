/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').directive('pad', function($log, $timeout) {
    return {
      scope:      {
        size:              '@?',
        color:             '@?',
        onTrigger:         '=?',
        mode:              '@?',
        ngModel:           '=?',
        data:              '=?',
        onActivate:        '=?',
        onDeactivate:      '=?',
        instrument:        '=?',
        action:            '=?',
        switchOnActivate:  '=?',
        triggerOnActivate: '=?'
      },
      transclude: true,
      link:       function(scope, element) {
        scope.triggerOnActivate = (typeof scope.triggerOnActivate === 'undefined' ? false : scope.triggerOnActivate);
        scope.switchOnActivate = false;
        
        var performAction = function(perform) {
          if (scope.action) {
            if (scope.action.note && scope.instrument) {
              if (perform === 'activate') {
                $log.debug(perform + ' note ' + scope.action.note);
                scope.instrument.triggerAttack(scope.action.note);
              } else if (perform === 'deactivate') {
                scope.instrument.triggerRelease(scope.action.note);
              } else if (perform === 'trigger') {
                scope.instrument.triggerAttackRelease(scope.action.note, "8n");
              }
            }
            if (scope.action.sample) {
              if (perform === 'trigger') {
                $log.debug('play sample...');
              }
            }
          }
        };

        scope.ngModel = scope.ngModel || {
            on:            false,
            active:        false,
            switchPad:     function(trigger) {
              scope.ngModel.on = !scope.ngModel.on;
              if (trigger) {
                scope.ngModel.triggerPad(scope.action);
              }
            },
            switchOn:      function(trigger) {
              scope.ngModel.on = true;
              if (trigger) {
                scope.ngModel.triggerPad(scope.action);
              }
            },
            switchOff:     function() {
              scope.ngModel.on = false;
            },
            triggerPad:    function() {
              //TODO CRITICAL: find better way to activate without timeout -> memory leak
              scope.ngModel.active = true;
              $timeout(function() {
                scope.ngModel.active = false;
              }, 200);
              if (scope.ngModel.on || scope.mode === 'trigger') {
                performAction('trigger');
              }
              if (scope.onTrigger) {
                scope.onTrigger(scope.ngModel.on, scope.data);
              }
            },
            activatePad:   function() {
              if ((scope.mode === 'switch' || scope.ngModel.on) || scope.mode === 'hold') { // -! - || +&& + || scope.mode === 'trigger' || scope.mode === 'hold'
                performAction('activate');
              }
              scope.ngModel.active = true;
              if (scope.onActivate) {
                scope.onActivate(scope.ngModel.on, scope.data);
              }
              if (scope.mode === 'switch' && scope.switchOnActivate) {
                scope.ngModel.switchPad(scope.triggerOnActivate);
              } else if (scope.mode === 'trigger') {
                scope.ngModel.triggerPad();
              }
            },
            deactivatePad: function() {
              if (scope.ngModel.active) {
                performAction('deactivate');
                scope.ngModel.active = false;
                if (scope.onDeactivate) {
                  scope.onDeactivate(scope.ngModel.on, scope.data);
                }
              }
            }
          };
        scope.mode = scope.mode || 'switch';
        scope.data = scope.data || {};
        scope.size = scope.size || 50;
        scope.color = scope.color || '#F06';

        scope.style = {
          width:  scope.size + 'px',
          height: scope.size + 'px'/*,
           backgroundColor: scope.color*/
        };

        //TODO make size dynamic
        /*scope.$watch('size', function() {
         if (typeof scope.size === 'number') {
         $log.debug('changed pad size to ', scope.size);
         scope.style = {
         width:  scope.size + 'px',
         height: scope.size + 'px'/!*,
         backgroundColor: scope.color*!/
         };
         }
         });*/

        scope.clickedPad = function(action) {
          if (scope.mode === 'switch') {
            scope.ngModel.switchPad(true);
          } else {
            scope.ngModel.activatePad(action);
          }
        };
      },
      template:   '<a href class="tone-pad" ng-mousedown="clickedPad(action)" ng-mouseup="ngModel.deactivatePad(action)" ng-mouseleave="ngModel.deactivatePad(action)" ng-style="style" ng-class="{\'on\':ngModel.on,\'active\':ngModel.active,\'trigger\':mode===\'trigger\',\'hold\':mode===\'hold\'}"><ng-transclude></ng-transclude></a>'
    };
  });
}());