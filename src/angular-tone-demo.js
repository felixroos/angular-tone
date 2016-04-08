/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone.demo', ['ec.angular.tone']).controller('SynthCtrl', function($scope, $log,
    Instruments) {
    $log.info('welcome to the angular-tone demo!');

    $scope.matrixOctave = 4;
    var a4, scale;
    $scope.$watch('matrixOctave', function() {
      a4 = teoria.note('c' + $scope.matrixOctave);
      scale = a4.scale('minorpentatonic').notes();
    });

    $scope.padTriggered = function(active, pad, matrix) {
      var index = Math.abs(scale.length - 1 - pad.y) % scale.length;
      var note = scale[index].scientific();
      if (active) {
        $log.debug('play note', note);
        $scope.polySynth.triggerAttackRelease(note, "8n");
      }
    };

    $scope.playCool = function() {
      $scope.polySynth.triggerAttackRelease('c4', '8n');
    };

    $scope.superDuper = function(time,col) {
      $scope.toneMatrix.triggerColumn(col % 8);
    };

    /*var loop = new Tone.Sequence(function(time, col) {
      //$scope.toneMatrix.triggerColumn(col);
      //$scope.colTrigger.triggerPad(col, 0);
      $scope.toneMatrix.triggerColumn(col % 8);

    }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "8n");
    Tone.Transport.start();*/
    //loop.start();

    $scope.yesYo = function() {
      console.debug('mute..');
      loop.mute = !loop.mute;
    };

  });
}());
