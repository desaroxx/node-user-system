angular.module('LoginCtrl', []).controller('LoginController', function($scope, $resource, localStorageService) {

	var User = $resource('/api/users/:id', {id: "@id"});
	var Login = $resource('/login');


	$scope.user = {};


	$scope.register = function(registerUser) {
		console.log('[LoginController] register(): email=' + registerUser.email + ', password=' + registerUser.password);
		var user = new User();
		user.email = registerUser.email;
		user.password = registerUser.password;
		user.$save();

		$scope.registerUser = {};
	};

	$scope.login = function(loginUser) {
		console.log('[LoginController] login(): email=' + loginUser.email + ', password=' + loginUser.password);
		var login = new Login();
		login.email = loginUser.email;
		login.password = loginUser.password;
		login.$save(function(response, responseHeader) {
			console.log('token: ' + response.token);
			console.log('user_id: ' + response.user_id);
			localStorageService.set('token', response.token);
			localStorageService.set('user_id', response.user_id);

		}, function(response) {
			console.log('status: ' + response.status + ': ' + response.statusText);
			console.log('error message: ' + response.data.error);
		});

		$scope.loginUser = {};
	};
});