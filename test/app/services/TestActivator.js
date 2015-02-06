'use strict';

var expect = require('chai').expect;

var jwt = require('jsonwebtoken');
var Activator = require('./../../../app/services/Activator');
var secretConfig = require('./../../../config/secret');

describe('TestActivator', function() {
	var secret = 'topsecretstring';
	var token;

	describe('generateToken()', function() {

		it('should generate valid token', function() {
			var user = {
				username: 'johnsnow',
				email: 'john@snow.com'
			};

			token = Activator.generateToken(user, secret);
			expect(token).to.be.a('string');
			expect(token).to.have.length.above(10);
		});
	});

	describe('verifyAndGetUser()', function() {

		it('should extract tokens correctly', function() {
			var user = Activator.verfiyAndGetUser(token, secret);
			expect(user).to.contain.keys('username', 'email');
		});

		it('should return null if token is invalid', function() {
			var user = Activator.verfiyAndGetUser(token, 'someSecret');
			expect(user).to.be.null;
		});

	});

});