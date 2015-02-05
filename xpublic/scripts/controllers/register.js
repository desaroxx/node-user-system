'use strict';

/**
 * @ngdoc function
 * @name skeletonApp.controller:RegisterCtrl
 * @description
 * # RegisterController
 * Controller of the skeletonApp
 */
angular.module('skeletonApp')
  .controller('RegisterCtrl', function ($scope, $resource) {
    console.log('[RegisterCtrl] loading...');

    var Register = $resource('/api/register');

    function isValidEmailFormat(email) {
      console.log('[RegisterCtrl] isValidEmailFormat()');
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    function getIsEmailFree(email) {
      console.log('[RegisterCtrl] getIsEmailFree()');
      Register.get({email: email}, function(response) {
        console.log('response.emailIsFree: ' + response.emailIsFree);
      });
    };

    $scope.isEmailFree = function(email) {
      console.log('[RegisterCtrl] isEmailFree():' + email);
      var isValidFormat = isValidEmailFormat(email);
      if (isValidFormat) {
        getIsEmailFree(email);
      } else {
        console.log('[RegisterCtrl] isEmailFree(): skipping getIsEmailFree()');
      }
    };

  })
  .controller('RegisterConfirmationCtrl', function($scope) {
  	console.log('[RegisterConfirmationCtrl] loading...');
  });
