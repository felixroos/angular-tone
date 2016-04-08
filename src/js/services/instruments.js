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