/**
 * Created by felix on 07.04.16.
 */
(function() {
  angular.module('ec.angular.tone', []).controller('SynthCtrl', function($scope, $log) {
    $log.info('welcome to the tone playground!');

    $scope.fatSynth = new Tone.MonoSynth({
      "portamento" : 0.01,
      "oscillator" : {
        "type" : "sine"
      },
      "envelope" : {
        "attack" : 0.005,
        "decay" : 0.2,
        "sustain" : 0.4,
        "release" : 1.4
      },
      "filterEnvelope" : {
        "attack" : 0.005,
        "decay" : 0.1,
        "sustain" : 0.05,
        "release" : 0.8,
        "baseFrequency" : 300,
        "octaves" : 4
      }
    }).toMaster();

    //$scope.polySynth = new Tone.PolySynth(3, Tone.MonoSynth).toMaster();


    $scope.attackSynth = function(note, frequency) {
      $scope.fatSynth.triggerAttack(frequency);
    };
    $scope.releaseSynth = function() {
      $scope.fatSynth.triggerRelease();
    };

    $scope.playSynth = function(active, pad, matrix) {
      console.debug(pad, matrix);
      if (active) {
        $scope.fatSynth.triggerAttackRelease("C#4", "8n");
      }
    };

    $scope.data = 20;
    $scope.options = {
      width: 75,
      fgColor: "#ffec03",
      skin: "tron",
      thickness: .2,
      displayPrevious: true
    };

    //create one of Tone's built-in synthesizers and connect it to the master output
  });
}());

