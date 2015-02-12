'use strict';
var expect = require('chai').expect;
var mongoose = require('mongoose');
var passwordHash = require('password-hash');

var rootPath = './../../..'
var User = require(rootPath + '/app/model/User');
var db = require(rootPath + '/config/db');

describe('TestUser', function() {

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
					username 			: 'JohnSnow',
					lowercaseUsername	: 'johnsnow',
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
				username 			: 'JohnSnow',
				lowercaseUsername	: 'johnsnow',
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

	describe('qFind(query)', function() {

		it('should return all query users', function(done) {
			User.qFind({})
			.then(function(users) {
				expect(users).to.have.length.above(0);
				done();
			});
		});

	});

	describe('qFindOne(query)', function() {

		it('should return queried user', function(done) {
			User.qFindOne({username:'johnsnow'})
			.then(function(user) {
				expect(user.username).to.equal('JohnSnow');
				done();
			});
		});

		it('should return null on query for inexistant value', function(done) {
			User.qFindOne({username:'somehtingunreal'})
			.then(function(user) {
				expect(user).to.be.null;
				done();
			});
		});

		it('should return case-insensitive for email queries', function(done) {
			User.qFindOne({email:'JOHN@SNOW.CoM'})
			.then(function(user) {
				expect(user.lowercaseUsername).to.equal('johnsnow');
				done();
			});
		});

		it('should return case-insensitive for username queries', function(done) {
			User.qFindOne({username:'JoHnSnOw'})
			.then(function(user) {
				expect(user.lowercaseUsername).to.equal('johnsnow');
				done();
			});
		});

		it('should return case-insensitive for OR queries', function(done) {
			var query = { $or:[ {email:'John@snow.com'}, {username:'raxx'}]}

			User.qFindOne(query)
			.then(function(user) {
				expect(user.lowercaseUsername).to.equal('johnsnow');
				done();
			});
		});


	});

	describe('qFindByUsername(username)', function() {

		it('should return queried user', function(done) {
			User.qFindByUsername('johnsnow')
			.then(function(user) {
				expect(user.username).to.equal('JohnSnow');
				done();
			});
		});

		it('should return case-insensitive queried user', function(done) {
			User.qFindByUsername('JoHnSnoW')
			.then(function(user) {
				expect(user.lowercaseUsername).to.equal('johnsnow');
				done();
			});
		});

	});

	describe('qFindByEmail(email)', function() {

		it('should return queried user', function(done) {
			User.qFindByEmail('john@snow.com')
			.then(function(user) {
				expect(user.lowercaseUsername).to.equal('johnsnow');
				done();
			});
		});
	});

	describe('qFindByUsernameAndUpdate()', function() {

		it('should return updated user if username is valid', function(done) {
			var update = {
				password : '2345resdf'
			};
			User.qFindByUsernameAndUpdate('JoHnSnOw', update)
			.then(function(user) {
				expect(user.password).to.equal('2345resdf');
				done();
			});
		});

		it('should return null if username is not valid', function(done) {
			var update = {
				password : '2345resdf'
			};
			User.qFindByUsernameAndUpdate('JoHnSnOwwyx', update)
			.then(function(user) {
				expect(user).to.be.null;
				done();
			});
		});
	});

	describe('qSave()', function() {

		it('should save new user', function(done) {
			var userData = {
				email 				: 'test@test.com',
				username 			: 'testuser',
				lowercaseUsername 	: 'testuser',
				password 			: '98uho123jlnweds'
			};
			var user = new User(userData);
			user.qSave()
			.then(function() {
				user.remove(function() {
					done();
				});
			});
			
		});
	});
});