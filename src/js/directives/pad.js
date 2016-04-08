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
        scope.triggerOnActivate = (scope.triggerOnActivate === 'undefined' ? true : scope.triggerOnActivate);
        scope.switchOnActivate = (scope.switchOnActivate === 'undefined' ? false : scope.switchOnActivate);
        
        var interpretAction = function(action, perform) {
          if (action.note && scope.instrument) {
            if (perform === 'activate') {
              $log.debug(perform + ' note ' + action.note);
              scope.instrument.triggerAttack(action.note);
            } else if (perform === 'deactivate') {
              scope.instrument.triggerRelease(action.note);
            }
            /*else if (perform === 'trigger') {
             scope.instrument.triggerAttackRelease(action.note, "8n");
             }*/
          }
          if (action.sample) {
            if (perform === 'trigger') {
              $log.debug('play sample...');
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
            triggerPad:    function(action) {
              if (action) {
                interpretAction(action, 'trigger');
              }
              if (scope.onTrigger) {
                scope.onTrigger(scope.ngModel.on, scope.data);
              }
            },
            activatePad:   function(action) {
              if (action && ((scope.mode === 'switch' && scope.ngModel.on) || scope.mode === 'trigger')) {
                interpretAction(action, 'activate');
              }
              scope.ngModel.active = true;
              if (scope.onActivate) {
                scope.onActivate(scope.ngModel.on, scope.data);
              }
              if (scope.mode === 'switch' && scope.switchOnActivate) {
                scope.ngModel.switchPad(scope.triggerOnActivate);
              } else if (scope.mode === 'trigger') { // && scope.triggerOnActivate
                scope.ngModel.triggerPad(action);
              }
            },
            deactivatePad: function(action) {
              if (scope.ngModel.active) {
                if (action) {
                  interpretAction(action, 'deactivate');
                }
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

        scope.clickedPad = function(action) {
          if (scope.mode === 'switch') {
            scope.ngModel.switchPad(true);
          } else {
            scope.ngModel.activatePad(action);
          }
        };
      },
      template:   '<a href class="tone-pad" ng-mousedown="clickedPad(action)" ng-mouseup="ngModel.deactivatePad(action)" ng-mouseleave="ngModel.deactivatePad(action)" ng-style="style" ng-class="{\'on\':ngModel.on,\'active\':ngModel.active,\'trigger\':mode===\'trigger\'}"><ng-transclude></ng-transclude></a>'
    };
  });
}());