/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone', []);
}());


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
/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').directive('keyboard', function() {
    return {
      scope:    {
        id:               '@',
        config:           '=?',
        width:            '=?',
        height:           '=?',
        octaves:          '=?',
        startNote:        '@?',
        whiteNotesColour: '@?',
        blackNotesColour: '@?',
        hoverColour:      '@?',
        keyUp:            '=?',
        keyDown:          '=?',
        synth:            '=?'
      },
      link:     function(scope) {
        scope.config = scope.config || scope;
        var keyboard = new QwertyHancock({
          id:               scope.config.id,
          width:            scope.config.width || 600,
          height:           scope.config.height || 150,
          octaves:          scope.config.octaves || 2,
          startNote:        scope.config.startNote || 'A3',
          whiteNotesColour: scope.config.whiteNotesColour || 'white',
          blackNotesColour: scope.config.blackNotesColour || 'black',
          hoverColour:      scope.config.hoverColour || '#f3e939'
        });
        keyboard.keyDown = function(note, frequency) {
          if (scope.keyDown) {
            scope.keyDown(note, frequency);
          }
          if (scope.synth) {
            scope.synth.triggerAttack(frequency);
          }
        };
        keyboard.keyUp = function(note, frequency) {
          if (scope.keyUp) {
            scope.keyUp(note, frequency);
          }
          if (scope.synth) {
            scope.synth.triggerRelease(frequency);
          }
        };
      },
      template: '<div ng-id="key"></div>'
    };
  });
}());
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
        octave:       '=?',
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
            var padsToInit = scope.initPads.split(' ');
            padsToInit.forEach(function(pad) {
              var position = pad.split(',');
              scope.ngModel.switchPad(position[0], position[1]);
            });
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
                x = options.index;
                break;
              case 'horizontal':
                limit = scope.width;
                measure = scope.height;
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
          },
          deactivateColumn: function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.deactivatePad(mapping);
            }, {
              direction: 'vertical',
              index:     index
            });
          },
          activateRow:      function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.activatePad(mapping);
            }, {
              direction: 'horizontal',
              index:     index
            });
          },
          deactivateRow:    function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.deactivatePad(mapping);
            }, {
              direction: 'horizontal',
              index:     index
            });
          },
          triggerColumn:    function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.triggerPad(mapping);
            }, {
              direction: 'vertical',
              index:     index
            });
          },
          triggerRow:       function(index) {
            scope.ngModel.forEachPad(function(pad, mapping) {
              pad.triggerPad(mapping);
            }, {
              direction: 'horizontal',
              index:     index
            });
          }
        };
      },
      template: '<div class="matrix"><div class="row" ng-repeat="(m,i) in getNumber(height) track by $index"><pad size="{{padSize}}" ng-repeat="(n,j) in getNumber(width) track by $index" on-activate="cellActivated" on-deactivate="cellDeactivated" on-trigger="cellTriggered" data="{x:n,y:m}" ng-model="ngModel.pads[m][n]" mode="{{padMode}}" instrument="instrument"></pad></div></div>'
    };
  });
}());
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
        color:     '@?',
        onTrigger: '=?',
        ngModel:   '=?',
        data:      '=?',
        places:    '=?',
        label:     '@?'

      },
      link:     function(scope) {
        scope.size = scope.size || 100;
        scope.places = scope.places || 0;
        scope.color = scope.color || '#fff';
        scope.min = scope.min || 0;
        scope.max = scope.max || 100;
        scope.range = scope.max - scope.min;

        scope.ngModel = scope.ngModel || scope.min;
        scope.style = {
          width:           scope.size + 'px',
          height:          scope.size + 'px',
          borderRadius:    scope.size / 2 + 'px',
          backgroundColor: scope.color
        };

        scope.rotatorStyle = {
          borderWidth: scope.size / 40 + 'px'
        };
        scope.$watch('ngModel', function() {
          if (typeof scope.ngModel === 'number') {
            var deg = (scope.ngModel / scope.max * 270) - 135;
            scope.rotatorStyle.transform = 'rotate(' + deg + 'deg)';
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
            scope.ngModel = raw > scope.max ? scope.max : raw;
          }
        };
      },
      template: '<div class="tone-poti noselect"><div ng-style="style" ng-mousedown="dragStart($event)" ng-mouseup="dragEnd()" ng-mousemove="dragMove($event)" ng-mouseleave="dragEnd()" ng-class="{\'active\':ngModel}" class="poti-container"><div class="poti-rotator" ng-style="rotatorStyle"></div></div><div class="poti-value">{{ngModel}}</div><div class="poti-label">{{label}}</div></div>' //
    };
  });
}());
/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').factory('Instruments', function($log) {
    var Instruments = {
      arsenal: {}
    };
    Instruments.add = function(name, type, config) {
      var instrument;
      $log.debug('adding instrument "' + name + '" of type ' + type + ' with config ', config);
      switch (type) {
        case 'mono':
          instrument = new Tone.MonoSynth(config || {}).toMaster();
          break;
        case 'poly':
          instrument = new Tone.PolySynth(config.voices || 3, Tone.SimpleSynth, config || {
              "oscillator": {
                "partials": [0, 2, 3, 4]
              }
            }).toMaster();
          break;
        default:
          $log.error('no valid instrument type: ', type);
          return false;
          break;
      }
      Instruments.arsenal[name] = instrument;
      $log.debug('instrument added: ', instrument);
      return Instruments.arsenal[name];
    };
    return Instruments;
  });
}());