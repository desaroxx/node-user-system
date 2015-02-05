'use strict';

/**
 * @ngdoc function
 * @name angularBootstrapApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularBootstrapApp
 */
angular.module('angularBootstrapApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
