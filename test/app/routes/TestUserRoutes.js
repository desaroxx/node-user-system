'use strict';

var expect = require('chai').expect;
var request = require('request');
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var mongoose = require('mongoose');
var User = require('./../../../app/model/User');
var db = require('./../../../config/db');

var secret = require('./../../../config/secret');

describe('Test: UserRoutes', function() {

	before(function(done) {
		
		mongoose.connect(db.url);
		mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
		mongoose.connection.once('open', function (callback) {
			// reset test user: john@snow.com

			// delete user
			var query = { $or:[ {email:'john@snow.com'}, {'username':'johnsnow'} ]};
			User.findOneAndRemove(query, function(err) {

				// create user
				var user = new User({
					email				: 'john@snow.com',
					username 			: 'johnsnow',
					lowercaseUsername 	: 'johnsnow',
					password 			: passwordHash.generate('Tenupu11'),
					activated			: true
				});
				user.save(function(err){
					if (err) throw new Error('failed to reset db');
					done();
				});
			});
		});
	});

	after(function(done) {
		// reset test user: john@snow.com

		// delete user
		var query = { $or:[ {email:'john@snow.com'}, {'username':'johnsnow'} ]};
		User.findOneAndRemove(query, function(err) {

			// create user
			var user = new User({
				email				: 'john@snow.com',
				username 			: 'johnsnow',
				lowercaseUsername 	: 'johnsnow',
				password 			: passwordHash.generate('Tenupu11'),
				activated			: true
			});	
			user.save(function(err){
				if (err) throw new Error('failed to reset db');
				mongoose.connection.close();
				done();
			});
		});
	});

	var baseUrl = 'http://localhost:8888/api/users';

	describe('GET /api/users/:username', function() {
		it('should get general user details for public', function(done) {
			var url = baseUrl + '/jOhnsnow';
			request.get({url:url}, function(err, response, body) {
				if (err) throw new Error('request failed');
				body = JSON.parse(body);
				expect(body).to.include.keys('username', '_id');
				expect(body.username.toLowerCase()).to.equal('johnsnow');
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
				expect(body.username.toLowerCase()).to.equal('johnsnow');
				done();
			});
		});

		it('should get details user details for himself', function(done) {
			var url = baseUrl + '/johnsnow';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'JohnSnow'
			},
			secret.key);

			request.get({url:url, json:true, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(body).to.have.keys('username', '_id', 'email');
				expect(body.username.toLowerCase()).to.equal('johnsnow');
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

		it('should be case insensitive', function(done) {
			var url = baseUrl + '/JOHNSNOW';

			request.get({url:url, json:true}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(response.statusCode).to.equal(200);
				done();
			});
		});	

	});

	describe('POST /api/users/:username', function() {

		beforeEach(function(done) {
			// reset test user: john@snow.com

			// delete user
			var query = { $or:[ {email:'john@snow.com'}, {'username':'johnsnow'} ]};
			User.findOneAndRemove(query, function(err) {

				// create user
				var user = new User({
					email				: 'john@snow.com',
					username 			: 'johnsnow',
					lowercaseUsername 	: 'johnsnow',
					password 			: passwordHash.generate('Tenupu11'),
					activated			: true
				});
				user.save(function(err){
					if (err) throw new Error('failed to reset db');
					done();
				});
			});
		});

		it('should not update duplicate username', function(done) {
			var url = baseUrl + '/JOHNSNOW';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'johnsnow'
			},
			secret.key);
			var update = {
				username: 'johnsnow'
			};

			request.put({url:url, json:true, body: update, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(response.statusCode).to.equal(400);
				expect(body.message).to.equal('username taken');
				done();
			});
		});



		it('should not update duplicate email', function(done) {
			var url = baseUrl + '/JOHNSNOW';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'johnsnow'
			},
			secret.key);
			var update = {
				email: 'john@snow.com'
			};

			request.put({url:url, json:true, body: update, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(response.statusCode).to.equal(400);
				expect(body.message).to.equal('email taken');
				done();
			});
		});

		it('should not update if invalid username format', function(done) {
			var url = baseUrl + '/JOHNSNOW';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'johnsnow'
			},
			secret.key);
			var update = {
				username: '123asd..12'
			};

			request.put({url:url, json:true, body: update, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(response.statusCode).to.equal(400);
				done();
			});
		});

		it('should not update if invalid email format', function(done) {
			var url = baseUrl + '/JOHNSNOW';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'johnsnow'
			},
			secret.key);
			var update = {
				email: 'qwewe.com'
			};

			request.put({url:url, json:true, body: update, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(response.statusCode).to.equal(400);
				done();
			});
		});

		it('should not update if invalid password format', function(done) {
			var url = baseUrl + '/JOHNSNOW';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'johnsnow'
			},
			secret.key);
			var update = {
				password: 'tenupu11'
			};

			request.put({url:url, json:true, body: update, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(response.statusCode).to.equal(400);
				done();
			});
		});

		it('should update username and stay case sensitive', function(done) {
			var url = baseUrl + '/jOhnsnow';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'johnsnow'
			},
			secret.key);
			var update = {
				username: 'JohnSniper'
			};

			request.put({url:url, json:true, body: update, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(body.username).to.equal('JohnSniper');
				expect(body.email).to.equal('john@snow.com');
				expect(body.token).to.not.equal(token);
				done();
			});
		});

		it('should update email', function(done) {
			var url = baseUrl + '/johnsnow';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'johnsnow'
			},
			secret.key);
			var update = {
				email: 'johnsnow@snow.com'
			};

			request.put({url:url, json:true, body: update, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(body.username).to.equal('johnsnow');
				expect(body.email).to.equal('johnsnow@snow.com');
				expect(body.token).to.not.equal(token);
				done();
			});
		});

		it('should update password', function(done) {
			var url = baseUrl + '/johnsnow';

			var token = jwt.sign(
			{
				email 	 	: 'john@snow.com', 
				_id		 	: '54d6717bace66533a05de6a4', 
				username 	: 'johnsnow'
			},
			secret.key);
			var update = {
				password: '79U2oh3jb'
			};

			request.put({url:url, json:true, body: update, auth: {bearer:token}}, function(err, response, body) {
				if (err) throw new Error('request failed');
				expect(body.username).to.equal('johnsnow');
				expect(body.email).to.equal('john@snow.com');
				done();
			});
		});
	});
});