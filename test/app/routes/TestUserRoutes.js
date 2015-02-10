'use strict';

var expect = require('chai').expect;
var request = require('request');
var jwt = require('jsonwebtoken');

var secret = require('./../../../config/secret');

describe('Test: UserRoutes', function() {

	var baseUrl = 'http://localhost:8888/api/users';

	describe('GET /api/users/:username', function() {
		it('should get general user details for public', function(done) {
			var url = baseUrl + '/jOhnsnow';
			request.get({url:url}, function(err, response, body) {
				if (err) throw new Error('request failed');
				body = JSON.parse(body);
				expect(body).to.include.keys('username', '_id');
				done();
			});
		});

		it('should get general user details for other user', function(done) {
			var url = baseUrl + '/johnsnow';

			var token = jwt.sign(
			{
				email 	 	: 'john@snowwy.com', 
				_id		 	: '54d6717badasdce66533a05de6a4', 
				username 	: 'asJohnsnow'
			},
			secret.key);

			request.get({url:url, json:true, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(body).to.have.keys('username', '_id');
				expect(body.username).to.equal('johnsnow');
				done();
			});
		});

		it('should get details user details for himself', function(done) {
			var url = baseUrl + '/johnsnow';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'Johnsnow'
			},
			secret.key);

			request.get({url:url, json:true, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(body).to.have.keys('username', '_id', 'email');
				expect(body.username).to.equal('johnsnow');
				expect(body.email).to.equal('john@snow.com');
				done();
			});
		});

		it('should reject invalid usernames', function(done) {
			var url = baseUrl + '/joxhnxsnxow';

			request.get({url:url, json:true}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(response.statusCode).to.equal(400);
				done();
			});
		});

	});

	describe('POST /api/users/:username', function() {

		it('should get update username', function(done) {
			var url = baseUrl + '/jOhnsnow';

			var oldToken = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'johnsnow'
			},
			secret.key);
			var update = {
				username: 'johnsniper'
			};

			request.put({url:url, json:true, body: update, auth: {bearer:oldToken}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(body).to.have.keys('username', '_id', 'email', 'token');
				expect(body.username).to.equal('johnsniper');
				expect(body.email).to.equal('john@snow.com');
				expect(body.token).to.not.equal(oldToken);

				// reset to previous
				var newToken = body.token;
				var downdateUrl = baseUrl + '/' + body.username;
				var downdate = {
					username: body.username
				};

				request.post({url:downdateUrl, json:true, body:downdate, auth: {bearer:body.token}}, function(downDateErr, downDateResponse, downDateBody) {
					if (downDateErr) throw new Error('request failed');
					expect(downDateBody).to.have.keys('username', '_id', 'email', 'token');
					expect(downDateBody.username).to.equal('johnsnow');
					expect(downDateBody.email).to.equal('john@snow.com');
					done();
				});
			});
		});
	});

});