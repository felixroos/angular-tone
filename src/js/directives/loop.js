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