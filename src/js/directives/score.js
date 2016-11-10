/**
 * Created by felix on 10.11.16.
 */
(function() {
  "use strict";
  angular.module('ec.angular.tone')
    .directive('score', function() {
      return {
        scope:      {
          width:         '@?',
          height:        '@?',
          notes:         '=?',
          timeSignature: '@?',
          clef:          '@?',
          noteLength:    '@?'
        },
        template:   '<div id="{{id}}"></div>{{notes}}',
        controller: function($scope, $timeout) {
          $scope.id = 'score-' + Date.now();
          $scope.timeSignature = $scope.timeSignature === undefined ? '4/4' : $scope.timeSignature;
          $scope.clef = $scope.clef === undefined ? 'treble' : $scope.clef;
          $scope.noteLength = $scope.noteLength || '4';
          
          $scope.notes = $scope.notes || 'C#5/q, B4, A4, G#4';
          var self = this, ready = false;
          
          function init() {
            self.vf = new Vex.Flow.Factory({
              renderer: {
                selector: $scope.id,
                width:    $scope.width || 900,
                height:   $scope.height || 200
              }
            });
            ready = true;
          }
          
          function update(notes) {
            if (!ready) {
              init();
            }
            var score = self.vf.EasyScore();
            var system = self.vf.System();
            
            var voice = score.voice(score.notes(notes));
            
            var stave = system.addStave({
              voices: [voice]
            });
            
            if ($scope.timeSignature) {
              stave.addTimeSignature($scope.timeSignature);
            }
            if ($scope.clef) {
              stave.addClef($scope.clef);
            }
            self.vf.draw();
          }
          
          $scope.$watch('notes', function(notes) {
            if (Array.isArray(notes)) {
              notes[0] += '/' + $scope.noteLength;
              notes = notes.join(',');
              $scope.notes = notes;
              return false;
            }
            $timeout(function() {
              update(notes);
            });
          });
        }
      }
    });
}());
