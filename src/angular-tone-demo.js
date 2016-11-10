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
    
    var floor = 40;
    
    function getSymmetricScale(h, n, count, start) {
      var notes = [], t = 0;
      for (t; t < count; ++t) {
        notes.push(teoria.note.fromKey(t * h + (n % h) + start).toString());
      }
      return notes;
    }
    
    function getAllSymmetricScales(maxH, count, start) {
      var t, h = 1, scales = {};
      for (; h < maxH; ++h) {
        scales[h] = scales[h] || [];
        t = 0;
        for (; t < h; ++t) {
          scales[h].push(getSymmetricScale(h, t, count, start));
        }
      }
      return scales;
    }
    
    $scope.intervals = [
      'Halbton', 'Ganzton', 'Kleine Terz', 'Große Terz', 'Quarte', 'Tritonus', 'Quinte', 'Kleine Sexte', 'Große Sexte',
      'Kleine Septime', 'Große Septime', 'Oktave'];
    
    console.log(teoria.note.fromKey(29).toString());
    console.warn(getSymmetricScale(2, 0, 10, floor)); //ganzton 1
    console.warn(getSymmetricScale(2, 1, 10, floor)); //ganzton 2
    console.warn(getSymmetricScale(3, 0, 10, floor)); //kleine terzen 1
    console.warn(getSymmetricScale(3, 1, 10, floor)); //kleine terzen 2
    console.warn(getSymmetricScale(3, 2, 10, floor)); //kleine terzen 3
    
    $scope.amount = 16;
    
    $scope.symmetricScales = getAllSymmetricScales(12, $scope.amount, 32);
    
    
    var ganzton = getSymmetricScale(2, 0, 4, floor);
    ganzton[0] += '/q';
    ganzton = ganzton.join(', ');
    console.debug('ganzton', ganzton);
    
  });
}());
