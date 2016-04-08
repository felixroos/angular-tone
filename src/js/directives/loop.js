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
        mute:      '=?',
        onTick:    '=?'
      },
      link:     function(scope) {
        scope.$watch('playButton', function() {
          if (scope.playButton) {
            scope.playButton.switchPad(true);
          }
        });

        scope.ngModel = new Tone.Sequence(function(time, col) {
          //$scope.toneMatrix.triggerColumn(col);
          //$scope.colTrigger.triggerPad(col, 0);
          if (typeof scope.onTick === 'function') {
            scope.onTick(col, time);
          }
        }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "8n");

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
        scope.$w
        scope.toggleMute = function(active) {
          scope.mute = active;
        };
        scope.$watch('mute', function() {
          scope.ngModel.mute = scope.mute;
        });
      },
      template: '<div class="tone-sequencer noselect"><pad ng-model="playButton" on-trigger="togglePlay" mode="switch"></pad><pad on-trigger="replay" mode="trigger"></pad><pad on-trigger="toggleMute" mode="switch"></pad></div>' //
    };
  });
}());