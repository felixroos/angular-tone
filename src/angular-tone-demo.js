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

    $scope.activateCol = function(active, pad) {
      $scope.toneMatrix.activateColumn(pad.x);
    };
    $scope.deactivateCol = function(active, pad) {
      $scope.toneMatrix.deactivateColumn(pad.x);
    };

    $scope.activateRow = function(active, pad) {
      $scope.toneMatrix.activateRow(pad.y);
    };
    $scope.deactivateRow = function(active, pad) {
      $scope.toneMatrix.deactivateRow(pad.y);
    };

    $scope.playCool = function() {
      $scope.polySynth.triggerAttackRelease('c4', '8n');
    };

    var col = 0;

    var note = new Tone.Event(function(time, pitch) {
      $scope.colTrigger.triggerPad(col++ % 8, 0);
      //$scope.polySynth.triggerAttackRelease(pitch, "16n", time);
    }, "C2");

    //set the note to loop every half measure
    note.set({
      "loop":    true,
      "loopEnd": "1m"
    });

    //start the note at the beginning of the Transport timeline
    note.start(0);

    //stop the note on the /*/**/*/4th measure
    note.stop("4m");

    Tone.Transport.schedule(function(time) {
      //time = sample accurate time of the event
    }, "1m");
    Tone.Transport.bpm.rampTo("300");
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = "1m";
    Tone.Transport.loopEnd = "4m";

    //Tone.Transport.start();
  });
}());
