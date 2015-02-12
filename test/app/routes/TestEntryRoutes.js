'use strict';

var mongoose        = require('mongoose');
var expect          = require('Chai').expect;
var request         = require('request');
var randomString    = require('randomstring');

var rootPath        = './../../../';
var AuthCtrl        = require(rootPath + 'app/controllers/AuthenticationController');
var secret          = require(rootPath + 'config/secret');