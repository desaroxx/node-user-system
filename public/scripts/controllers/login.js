'use strict';

/**
 * @ngdoc function
 * @name skeletonApp.controller:LoginCtrl
 * @description
 * # LoginController
 * Controller of the skeletonApp
 */
angular.module('skeletonApp')
  .controller('LoginCtrl', function ($scope) {
    console.log('[LoginCtrl] loading...')

    $scope.login = function(user) {
      console.log('[LoginCtrl] login(): ' + user.email + ', ' + user.password);
      $scope.user = {};
    };
  });
