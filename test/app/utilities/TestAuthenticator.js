var expect = require('chai').expect;

var Authenticator = require('app/utilities/Authenticator');
var secret = require('./../../../config/secret');

describe('TestAuthentication', function() {

	describe('getUser()', function() {

		it('should return a user', function() {
			var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImpvaG5Ac25vdy5jaCIsIl9pZCI6IjU0ZDNiYTBhMWJkY2M2OTQ5ZTcwM2YzYyIsInVzZXJuYW1lIjoiam9obnNub3ciLCJpYXQiOjE0MjMxNzA0MTB9.RrftBrGYXP-lSMNPZ8fGNlsCB2kqntA8-HnxPc1oCiI';
			var user = Authenticator.getUser(token, secret.key);
			expect(user).to.include.keys('email', 'username', '_id');
		});

		it('should throw exception for invalid token', function() {
			var invalidToken = 'adasd.eyJlbWFpbCI6ImpvaG5Ac25vdy5jaCIsIl9pZCI6IjU0ZDNiYTBhMWJkY2M2OTQ5ZTcwM2YzYyIsInVzZXJuYW1lIjoiam9obnNub3ciLCJpYXQiOjE0MjMxNzA0MTB9.RrftBrGYXP-lSMNPZ8fGNlsCB2kqntA8-HnxPc1oCiI';
			var user = Authenticator.getUser(invalidToken, secret.key);
			expect(user).to.be.null;
		});

		it('should throw expection for undefined input', function() {
			var object = {};
			var user = Authenticator.getUser(object.inexistantToken, secret.key);
			expect(user).to.be.null;
		});
	});
});