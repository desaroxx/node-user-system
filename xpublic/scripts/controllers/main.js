'use strict';

/**
 * @ngdoc function
 * @name skeletonApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the skeletonApp
 */
angular.module('skeletonApp')
  .controller('MainCtrl', function ($scope, $resource) {
  	console.log('[MainCtrl] loading...');

  	var Entries = $resource('/api/entries');

  	function getEntries() {
  		console.log('[MainCtrl] getEntries()');
  		Entries.get({}, function(response) {
  			response.entries.forEach(function(entry) {
  				console.log('User: ' + entry.user_id);
  				console.log(entry.content);
  			});
  		});
  	}

  	getEntries();
    
  });
