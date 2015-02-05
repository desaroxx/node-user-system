'use strict';

/**
 * @ngdoc function
 * @name angularBootstrapApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the angularBootstrapApp
 */
angular.module('angularBootstrapApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
