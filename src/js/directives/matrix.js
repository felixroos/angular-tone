/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').directive('matrix', function($log) {
    return {
      restrict: 'E',
      scope:    {
        width:        '=?',
        height:       '=?',
        onTrigger:    '=?',
        onActivate:   '=?',
        onDeactivate: '=?',
        ngModel:      '=?',
        padSize:      '@?',
        padMode:      '@?',
        initPads:     '@?',
        mapping:      '@?',
        root:         '@',
        scale:        '@?',
        octave:       '=?', //TODO
        instrument:   '=?',
        matrix:       '=?'
      },
      link:     function(scope) {
        scope.width = typeof scope.width === "number" ? scope.width : 4;
        scope.height = typeof scope.height === "number" ? scope.height : 4;
        scope.padSize = typeof scope.padSize === 'number' ? scope.padSize : 50;
        scope.padMode = scope.padMode || 'switch';

        var mapping, control, root  = scope.root || "c", scale = scope.scale ||
          "minorpentatonic", octave = scope.octave || "4";

        if (typeof scope.mapping === 'string') {
          mapping = scope.mapping.split(' ');
          if (mapping[0] === 'scale' || mapping[1] === 'scale') {
            root = teoria.note(root + octave);
            scale = root.scale(scale).notes();
          } else if (mapping[0] === 'horizontal' || mapping[0] === 'vertical') {
            control = mapping[0];
          }
        }

        scope.getNumber = function(num) {
          return new Array(num);
        };

        scope.cellTriggered = function(active, position) {
          if (scope.onTrigger) {
            scope.onTrigger(active, position, scope.ngModel.pads);
          }
        };

        scope.cellActivated = function(active, position) {
          if (scope.matrix && control) {
            scope.matrix.forEachPad(function(pad, mapping) {
              pad.activatePad(mapping);
            }, {
              direction: control,
              index:     control === 'horizontal' ? position.y : position.x
            });
          }
          if (scope.onActivate) {
            scope.onActivate(active, position, scope.ngModel.pads);
          }
        };

        scope.cellDeactivated = function(active, position) {
          if (scope.matrix && control) {
            scope.matrix.forEachPad(function(pad, mapping) {
              pad.deactivatePad(mapping);
            }, {
              direction: control,
              index:     control === 'horizontal' ? position.y : position.x
            });
          }
          if (scope.onDeactivate) {
            scope.onDeactivate(active, position, scope.ngModel.pads);
          }
        };

        scope.$watch('ngModel.pads', function() {
          if (typeof scope.ngModel.pads === 'object' && typeof scope.initPads === 'string') {
            if (scope.initPads === 'random') {
              var r = 0;
              for (r; r < scope.width * scope.height; r++) {
                scope.ngModel.switchPad(Math.floor(Math.random() * scope.width), Math.floor(Math.random() *
                  scope.height));
              }
            } else {
              var padsToInit = scope.initPads.split(' ');
              padsToInit.forEach(function(pad) {
                var position = pad.split(',');
                scope.ngModel.switchPad(position[0], position[1]);
              });
            }
          }
        });

        scope.ngModel = {
          getPad:           function(x, y) {
            return scope.ngModel.pads[y][x];
          },
          getMapping:       function(x, y) {
            if (mapping && scale) {
              if (mapping[0] === 'scale') {
                return {note: scale[x % scale.length].scientific()};
              }
              if (mapping[1] === 'scale') {
                return {note: scale[(scope.height - 1 - y) % scale.length].scientific()};
              }
            }
          },
          triggerPad:       function(x, y) {
            return scope.ngModel.getPad(x, y).triggerPad();
          },
          switchPad:        function(x, y) {
            return scope.ngModel.getPad(x, y).switchPad();
          },
          forEachPad:       function(callback, options) {
            var i = 0;
            var x, y;
            var limit = 0, measure = 0;
            switch (options.direction) {
              case 'vertical':
                limit = scope.height;
                measure = scope.width;
                options.index = options.index % measure;
                x = options.index;
                break;
              case 'horizontal':
                limit = scope.width;
                measure = scope.height;
                options.index = options.index % measure;
                y = options.index;
                break;
              default:
                $log.error('Matrix forEachPad: no direction specified, use vertical or horizontal!');
            }

            if (typeof options.index !== 'number' || options.index > measure - 1) {
              $log.error('forEachPad: index must be defined and between 0 and ' + (measure - 1));
            }

            for (i; i < limit; i++) {

              if (options.direction === 'vertical') {
                callback(scope.ngModel.getPad(x, i), scope.ngModel.getMapping(x, i));
              } else if (options.direction === 'horizontal') {
                callback(scope.ngModel.getPad(i, y), scope.ngModel.getMapping(i, y));
              }
            }
          },
          activateColumn:   function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.activatePad(mapping);
            }, {
              direction: 'vertical',
              index:     index
            });
            scope.$digest();
          },
          deactivateColumn: function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.deactivatePad(mapping);
            }, {
              direction: 'vertical',
              index:     index
            });
            scope.$digest();
          },
          activateRow:      function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.activatePad(mapping);
            }, {
              direction: 'horizontal',
              index:     index
            });
            scope.$digest();
          },
          deactivateRow:    function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.deactivatePad(mapping);
            }, {
              direction: 'horizontal',
              index:     index
            });
            scope.$digest();
          },
          triggerColumn:    function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.triggerPad(mapping);
            }, {
              direction: 'vertical',
              index:     index
            });
            scope.$digest();
          },
          triggerRow:       function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.triggerPad(mapping);
            }, {
              direction: 'horizontal',
              index:     index
            });
            scope.$digest();
          }
        };
      },
      template: '<div class="matrix"><div class="row" ng-repeat="(m,i) in getNumber(height) track by $index"><pad size="{{padSize}}" ng-repeat="(n,j) in getNumber(width) track by $index" on-activate="cellActivated" on-deactivate="cellDeactivated" on-trigger="cellTriggered" data="{x:n,y:m}" ng-model="ngModel.pads[m][n]" mode="{{padMode}}" instrument="instrument"></pad></div></div>'
    };
  });
}());