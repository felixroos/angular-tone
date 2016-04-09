/**
 * Created by felix on 07.04.16.
 */
(function() {
  'use strict';
  angular.module('ec.angular.tone.demo', ['ec.angular.tone']).config(function($logProvider) {
    $logProvider.debugEnabled(false);
  }).controller('SynthCtrl', function($scope, $log, Instruments) {
    $log.info('welcome to the angular-tone demo!');

  });
}());
