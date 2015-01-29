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
    'ngMaterial'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
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
  .controller('ApplicationController', function ($scope, $mdDialog) {

  });


