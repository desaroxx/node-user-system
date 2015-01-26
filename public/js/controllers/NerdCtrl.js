angular.module('NerdCtrl', []).controller('NerdController', function($scope, $resource) {

	var User = $resource('/api/user/:id', {id: "@id"});
	var Entry = $resource('/api/entry/:id', {id: "@id"});

	$scope.tagline = 'Nothing beats a pocket protector!';

	$scope.users = [];
	$scope.entries = [];
	$scope.newEntry = {};

	function updateUsers() {
		User.get({}, function(json) {
			$scope.users = json.users;
		});
	};

	$scope.updateEntries = function() {
		console.log("changing user entries: ");
		console.log($scope.selectedUser._id);

		var selectedUserId = $scope.selectedUser._id;
		Entry.get({user_id: selectedUserId,}, function(json) {
			console.log(json);
			$scope.entries = json.entries;
		});

	}

	$scope.createEntry = function(content) {
		var entry = new Entry();
		entry.user_id = $scope.selectedUser._id;
		entry.content = content;
		entry.$save();

		$scope.updateEntries();

		// reset form
		$scope.newContent = "";
	};

	$scope.deleteEntry = function(entry) {
		Entry.delete({}, {id:entry._id});
		$scope.updateEntries();
	};


	// initial load
	updateUsers();

});