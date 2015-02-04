'use strict';

/**
 * @ngdoc overview
 * @name skeletonApp
 * @description
 * # skeletonApp
 *
 * Main module of the application.
 */
angular
  .module('skeletonApp', [
    'ngAnimate',
    'ngAria',
    'ngResource',
    'ngRoute',
    'ngMaterial',
    'LocalStorageModule'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .when('/entries', {
        templateUrl: 'views/entries.html',
        controller: 'EntriesCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
      $locationProvider.html5Mode(true);
  })
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('green');
  })
  .controller('ApplicationCtrl', function ($scope, $rootScope, $mdDialog, localStorageService) {
    console.log('[ApplicationCtrl] loading...');

    $scope.tabs = [
      {
        title: "Home"
      },{
        title: "Trending"
      }, {
        title: "Best Rated"
      }, {
        title: "Sports"
      }, {
        title: "Tech"
      }, {
        title: "Business"
      }];

    $scope.showUser = false;
    $scope.showLogin = true;

    $scope.email = "x";

    $rootScope.$on('eventUserLogin', function() {
      console.log('[ApplicationCtrl] received event: eventUserLogin');
      login();
    });

    function login() {
      console.log('[ApplicationCtrl] login()');
      $scope.email = localStorageService.get('email');

      // switch buttons
      $scope.showUser = true;
      $scope.showLogin = false;
    };

    $scope.logout = function() {
      console.log('[ApplicationCtrl] logout()');

      // unset user details from local storage
      localStorageService.clearAll();
      
      // switch buttons
      $scope.showUser = false;
      $scope.showLogin = true;
    };

    function isLoggedIn() {
      console.log('[ApplicationCtrl] isLoggedIn()');
      
      var email = localStorageService.get('email');
      if ((email != null) && (email.length > 0)) {
        login();
      }
    };
    isLoggedIn();
  });


