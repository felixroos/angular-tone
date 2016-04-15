/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone.demo', ['ec.angular.tone']).config(function($logProvider) {
    $logProvider.debugEnabled(true);
  }).controller('SynthCtrl', function($scope, $log, Instruments) {
    $log.info('welcome to the angular-tone demo!');
    $scope.fmSynth = new Tone.SimpleFM({
      "modulationIndex": 12.22,
      "carrier":         {
        "envelope": {
          "attack": 0.01,
          "decay":  0.2
        }
      },
      "modulator":       {
        "oscillator": {
          "type": "square"
        },
        "envelope":   {
          "attack": 0.2,
          "decay":  0.01
        }
      }
    }).toMaster();
    $scope.pluckySynth = new Tone.PluckSynth().toMaster();
  });
}());
