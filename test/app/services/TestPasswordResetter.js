'use strict';

var expect = require('chai').expect;

var jwt = require('jsonwebtoken');
var PasswordResetter = require('./../../../app/services/PasswordResetter');
var secretConfig = require('./../../../config/secret');

describe('TestActivator', function() {
	var secret = 'topsecretstring';
	var token;

	describe('generateToken()', function() {

		it('should generate valid token', function() {
			var email = 'john@snow.com';

			token = PasswordResetter.generateToken(email, secret);
			expect(token).to.be.a('string');
			expect(token).to.have.length.above(10);
		});
	});

	describe('verifyAndGetUser()', function() {

		it('should extract tokens correctly', function() {
			var email = PasswordResetter.verfiyAndGetEmail(token, secret);
			expect(email).to.be.a('string');
		});

		it('should return null if token is invalid', function() {
			var email = PasswordResetter.verfiyAndGetEmail(token, 'someSecret');
			expect(email).to.be.null;
		});

	});

});