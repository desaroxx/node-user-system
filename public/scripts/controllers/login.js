'use strict';

/**
 * @ngdoc function
 * @name skeletonApp.controller:LoginCtrl
 * @description
 * # LoginController
 * Controller of the skeletonApp
 */
angular.module('skeletonApp')
	.controller('LoginCtrl', function ($scope, $rootScope, $location, localStorageService, $resource, $mdToast, $animate) {
	    console.log('[LoginCtrl] loading...');

		var Login = $resource('/login');

		$scope.showLoginError = false;
		$scope.showLoading = false;

	    $scope.login = function(user) {			
	    	console.log('[LoginCtrl] login():');

	    	// update view
	    	$scope.showLoading = true;


	    	// process login
			var login = new Login();
			login.email = user.email;
			login.password = user.password;
			login.$save(function(response, responseHeader) {
				console.log('[LoginCtrl] token: ' + response.token);
				console.log('[LoginCtrl] user_id: ' + response.user_id);
				localStorageService.set('token', response.token);
				localStorageService.set('user_id', response.user_id);
				localStorageService.set('email', response.email);

				$scope.user = {};

				$location.path("/entries");

				$rootScope.$emit('eventUserLogin');

			}, function(response) {
				console.log('[LoginCtrl] status: ' + response.status + ': ' + response.statusText);
				console.log('[LoginCtrl] error message: ' + response.data.error);

				$scope.showLoading = false;
				$scope.showLoginError = true;
			});
		};

	});
