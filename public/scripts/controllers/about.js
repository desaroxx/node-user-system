'use strict';

/**
 * @ngdoc function
 * @name skeletonApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the skeletonApp
 */
angular.module('skeletonApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
