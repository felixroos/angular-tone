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
            scope.synth.triggerRelease();
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
  angular.module('ec.angular.tone').directive('loop', function() {
    return {
      scope:    {
        ngModel:   '=?',
        autostart: '=?',
        length:    '=?',
        mute:      '=?',
        onTick:    '=?',
        reverse:   '=?'
      },
      link:     function(scope) {
        scope.$watch('playButton', function() {
          if (scope.playButton && scope.autostart) {
            scope.playButton.switchPad(true);
          }
        });
        scope.length = (typeof scope.length === 'number' ? scope.length : 16);

        var updateSequence = function(pattern) {
          scope.ngModel = new Tone.Sequence(function(time, col) {
            if (typeof scope.onTick === 'function') {
              if (!scope.reverse) {
                scope.onTick(col, time);
              } else {
                scope.onTick(scope.length - col, time);
              }
            }
          }, pattern, "8n");
        };

        scope.$watch('length', function() {
          var n, pattern = [];
          for (n = 0; n < scope.length; n++) {
            pattern.push(n);
          }
          updateSequence(pattern);
        });

        Tone.Transport.start();
        //loop.start();

        scope.togglePlay = function(active) {
          scope.isPlaying = active;
        };
        scope.replay = function() {
          scope.ngModel.stop();
          scope.ngModel.start();
        };
        scope.$watch('isPlaying', function() {
          if (scope.isPlaying) {
            scope.ngModel.start();
          } else {
            scope.ngModel.stop();
          }
        });
        scope.reverseLoop = function() {
          scope.reverse = !scope.reverse;
        };
        scope.toggleMute = function(active) {
          scope.mute = active;
        };
        scope.$watch('mute', function() {
          scope.ngModel.mute = scope.mute;
        });
      },
      template: '<div class="tone-loop pads noselect">' +
                '<pad ng-model="playButton" on-trigger="togglePlay" mode="switch"><div tone-icon="play_arrow"></div></pad>' +
                '<pad on-trigger="replay" mode="trigger"><div tone-icon="replay"></div></pad>' +
                '<pad on-trigger="toggleMute" mode="switch"><div tone-icon="volume_mute"></div></pad>' +
                '<pad on-trigger="reverseLoop" mode="switch"><div tone-icon="swap_horiz"></div></pad></div>'
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
        padSize:      '=?',
        padMode:      '@?',
        initPads:     '@?',
        mapping:      '@?',
        root:         '@',
        scale:        '@?',
        scaleOffset:  '=?',
        octave:       '=?',
        instrument:   '=?',
        matrix:       '=?',
        showLabels:   '=?'
      },
      link:     function(scope) {
        scope.width = typeof scope.width === "number" ? scope.width : 4;
        scope.height = typeof scope.height === "number" ? scope.height : 4;
        scope.padSize = typeof scope.padSize === 'number' ? scope.padSize : 50;
        scope.scaleOffset = typeof scope.scaleOffset === 'number' ? scope.scaleOffset : 0;
        scope.padMode = scope.padMode || 'switch';

        var mapping, control;

        scope.getNumber = function(num) {
          return new Array(num);
        };

        var getNotes = function() {
          var root   = scope.root || "c", scale = scope.scale || "minorpentatonic", octave = scope.octave ||
            4, notes = [], nextNotes;
          var measure = scope.width > scope.height ? scope.width : scope.height;
          //get all notes that fit into the matrix, starting from root
          var scaleNotes = teoria.note(root + octave).scale(scale).simple();
          var rootOctave = octave + Math.floor(scope.scaleOffset / scaleNotes.length);
          while (notes.length < measure) {
            nextNotes = teoria.note(root + rootOctave).scale(scale).notes();
            if (scope.scaleOffset && notes.length === 0) {
              notes.push.apply(notes, nextNotes.slice(scope.scaleOffset % scaleNotes.length, nextNotes.length));
            } else {
              notes.push.apply(notes, nextNotes);
            }
            ++rootOctave;
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

        scope.$watchGroup(['octave', 'scale', 'scaleOffset', 'root'], function() {
          /*$log.debug('changed octave (' + scope.octave + ') or scale (' + scope.scale + ') or scaleOffset (' +
           scope.scaleOffset + ')');*/
          if (typeof scope.mapping === 'string') {
            mapping = scope.mapping.split(' ');
            if (mapping[0] === 'scale' || mapping[1] === 'scale') {
              scope.notes = getNotes();
            } else if (mapping[0] === 'horizontal' || mapping[0] === 'vertical') {
              control = mapping[0];
            }
          }
          scope.padData = loadPadData();
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
            //TODO random mode with only one note at a time!!!
            var r = 0;
            scope.ngModel.clear();
            chance = chance || 0.3;
            for (r; r < scope.width * scope.height * chance; r++) {
              scope.ngModel.switchPad(Math.floor(Math.random() * scope.width), Math.floor(Math.random() *
                scope.height));
            }
          },
          changeScale:      function(scale) {
            $log.debug('change scale to ' + scale);
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
/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone').directive('mixer', function($log) {
    return {
      scope:    {
        ngModel:  '=?',
        potiSize: '=?'
      },
      link:     function(scope) {
        scope.isNumber = function(value) {
          return typeof value === 'number';
        };
        scope.potiSize = (typeof scope.potiSize === 'numeric' ? scope.potiSize : 50);
        scope.loading = true;
        scope.$watch('ngModel', function() {
          if (typeof scope.ngModel === 'object') {
            scope.loading = false;
            $log.debug('link mixer for object ', scope.ngModel);
          }
        });
      },
      template: '<div class="tone-mixer potis" ng-if="!loading"><poti size="{{potiSize}}" ng-if="isNumber(param)" label="{{key}}" ng-repeat="(key, param) in ngModel" ng-model="param"></poti></div>'
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
        scope.triggerOnActivate = (typeof scope.triggerOnActivate === 'undefined' ? false : scope.triggerOnActivate);
        scope.switchOnActivate = false;

        var performNotes = function(perform, notes) {
          if (!scope.instrument) {
            $log.error('pad: no instrument given to ' + perform);
            return false;
          }
          if (!notes) {
            $log.error('pad: no note given to ' + perform);
            return false;
          }
          if (perform === 'activate') {
            scope.instrument.triggerAttack(notes);
          } else if (perform === 'deactivate') {
            scope.instrument.triggerRelease(notes);
            //scope.instrument.triggerRelease();
          } else if (perform === 'trigger') {
            scope.instrument.triggerAttackRelease(notes, "8n");
          }
        };

        var performAction = function(perform) {
          if (scope.action) {
            if (scope.action.note && scope.instrument) {
              if (scope.action.chord) {
                var notes = teoria.note(scope.action.note).chord(scope.action.chord).notes();
                notes.forEach(function(note) {
                  performNotes(perform, note.scientific());
                });
              } else {
                performNotes(perform, scope.action.note);
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
              if (scope.mode === 'trigger' || scope.ngModel.on) { // ||
                performAction('trigger');
              }
              if (scope.onTrigger) {
                scope.onTrigger(scope.ngModel.on, scope.data);
              }
            },
            activatePad:   function() {
              if ((scope.mode === 'switch' && scope.ngModel.on) || scope.mode === 'hold') { // -! - || +&& + || scope.mode === 'trigger' || scope.mode === 'hold'
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
      template:   '<div class="tone-pad noselect" ng-mousedown="clickedPad(action)" ng-mouseup="ngModel.deactivatePad(action)" ng-mouseleave="ngModel.deactivatePad(action)" ng-style="style" ng-class="{\'on\':ngModel.on,\'active\':ngModel.active,\'trigger\':mode===\'trigger\',\'hold\':mode===\'hold\'}"><ng-transclude></ng-transclude></a>'
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
/**
 * Created by felix on 10.04.16.
 */

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
          instrument = new Tone.PolySynth(config.voices || 6, Tone.MonoSynth).toMaster();
          console.debug(instrument.get());
          instrument.set(config || {});
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