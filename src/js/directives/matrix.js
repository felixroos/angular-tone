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
        padSize:      '=?',
        padMode:      '@?',
        initPads:     '@?',
        mapping:      '@?',
        root:         '@',
        scale:        '@?',
        octave:       '=?',
        instrument:   '=?',
        matrix:       '=?',
        showLabels:   '=?'
      },
      link:     function(scope) {
        scope.width = typeof scope.width === "number" ? scope.width : 4;
        scope.height = typeof scope.height === "number" ? scope.height : 4;
        scope.padSize = typeof scope.padSize === 'number' ? scope.padSize : 50;
        scope.padMode = scope.padMode || 'switch';

        var mapping, control;

        scope.getNumber = function(num) {
          return new Array(num);
        };

        var getNotes = function() {
          var root   = scope.root || "c", scale = scope.scale || "minorpentatonic", octave = scope.octave ||
            4, notes = [];
          var measure = scope.width > scope.height ? scope.width : scope.height;
          //get all notes that fit into the matrix, starting from root
          while (notes.length < measure) {
            ++octave;
            notes.push.apply(notes, teoria.note(root + octave).scale(scale).notes());
          }
          return notes;
        };

        var getMapping = function(x, y) {
          if (mapping && scope.notes) {
            if (mapping[0] === 'scale') {
              return {note: scope.notes[x].scientific()};
            }
            if (mapping[1] === 'scale') {
              return {note: scope.notes[(scope.height - 1 - y)].scientific()};
            }
          }
        };

        var loadPadData = function() {
          var x, y, pads = new Array(scope.height);
          for (y = 0; y < scope.height; y++) {
            pads[y] = new Array(scope.width);
            for (x = 0; x < scope.width; x++) {
              pads[y][x] = {
                x:      x,
                y:      y,
                action: getMapping(x, y)
              };
            }
          }
          return pads;
        };

        scope.cellTriggered = function(active, position) {
          if (scope.onTrigger) {
            scope.onTrigger(active, position, scope.ngModel.pads);
          }
        };

        scope.cellActivated = function(active, position) {
          if (scope.matrix && control) {
            scope.matrix.forEachPad(function(pad) {
              pad.activatePad();
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
            scope.matrix.forEachPad(function(pad) {
              pad.deactivatePad();
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
          $log.debug('matrix pads loaded');
          if (typeof scope.ngModel.pads === 'object' && typeof scope.initPads === 'string') {
            if (scope.initPads === 'random') {
              scope.ngModel.randomize();
            } else {
              var padsToInit = scope.initPads.split(' ');
              padsToInit.forEach(function(pad) {
                var position = pad.split(',');
                scope.ngModel.switchPad(position[0], position[1]);
              });
            }
          }
        });

        //TODO save matrix state and move up/down octaves without changing notes
        //TODO pagination in time to move left/right without changing notes and
        //TODO paginate mapping to display current page/octave!!!

        scope.$watchGroup(['octave', 'scale'], function() {
          //if(scope.octave&&scope.scale) {
          $log.debug('changed octave (' + scope.octave + ') or scale (' + scope.scale + ')');
          if (typeof scope.mapping === 'string') {
            mapping = scope.mapping.split(' ');
            if (mapping[0] === 'scale' || mapping[1] === 'scale') {
              scope.notes = getNotes();
            } else if (mapping[0] === 'horizontal' || mapping[0] === 'vertical') {
              control = mapping[0];
            }
          }
          scope.padData = loadPadData();
          //}
        });
        scope.$watch('padSize', function() {
          $log.debug('changed pad size to ', scope.padSize);
        });

        scope.ngModel = {
          getPad:           function(x, y) {
            return scope.ngModel.pads[y][x];
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
                callback(scope.ngModel.getPad(x, i)); //, getMapping(x, i)
              } else if (options.direction === 'horizontal') {
                callback(scope.ngModel.getPad(i, y)); //, getMapping(i, y)
              }
            }
          },
          randomize:        function(chance) {
            var r = 0;
            scope.ngModel.clear();
            chance = chance || 0.3;
            for (r; r < scope.width * scope.height * chance; r++) {
              scope.ngModel.switchPad(Math.floor(Math.random() * scope.width), Math.floor(Math.random() *
                scope.height));
            }
          },
          changeScale:      function(scale) {
            console.debug('change scale ', scale);
            scope.scale = scale;
          },
          clear:            function() {
            if (scope.ngModel.pads) {
              var n;
              for (n = 0; n < scope.height; n++) {
                scope.ngModel.forEachPad(function(pad) {
                  pad.switchOff();
                }, {
                  direction: 'horizontal',
                  index:     n
                });
              }
            }
          },
          activateColumn:   function(index) {
            scope.ngModel.forEachPad(function(pad) {
              pad.activatePad(mapping);
            }, {
              direction: 'vertical',
              index:     index
            });
            scope.$digest();
          },
          deactivateColumn: function(index) {
            scope.ngModel.forEachPad(function(pad) {
              pad.deactivatePad(mapping);
            }, {
              direction: 'vertical',
              index:     index
            });
            scope.$digest();
          },
          activateRow:      function(index) {
            scope.ngModel.forEachPad(function(pad) {
              pad.activatePad(mapping);
            }, {
              direction: 'horizontal',
              index:     index
            });
            scope.$digest();
          },
          deactivateRow:    function(index) {
            scope.ngModel.forEachPad(function(pad) {
              pad.deactivatePad(mapping);
            }, {
              direction: 'horizontal',
              index:     index
            });
            scope.$digest();
          },
          triggerColumn:    function(index) {
            /* scope.ngModel.deactivateColumn(index ? index - 1 : scope.width - 1);
             scope.ngModel.activateColumn(index);*/
            scope.ngModel.forEachPad(function(pad) {
              pad.triggerPad(mapping);
            }, {
              direction: 'vertical',
              index:     index
            });
            scope.$digest();
          },
          triggerRow:       function(index) {

            /*scope.ngModel.deactivateRow(index ? index - 1 : scope.height - 1);
             scope.ngModel.activateRow(index);*/
            scope.ngModel.forEachPad(function(pad) {
              pad.triggerPad(mapping);
            }, {
              direction: 'horizontal',
              index:     index
            });
            scope.$digest();
          }
        };
      },
      template: '<div class="matrix"><div class="row" ng-repeat="row in padData track by $index"><pad ng-repeat="cellData in row track by $index" ' +
                'size="{{padSize}}" on-activate="cellActivated" ' +
                'on-deactivate="cellDeactivated" on-trigger="cellTriggered" data="cellData" action="cellData.action" ng-model="ngModel.pads[cellData.y][cellData.x]" ' +
                'mode="{{padMode}}" instrument="instrument">{{showLabels?cellData.action.note:\'\'}}</pad></div></div><div class="clearfix"></div></div>'
    };
  });
}());