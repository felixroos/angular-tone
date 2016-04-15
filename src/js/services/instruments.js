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