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
					email		: 'john@snow.com',
					username 	: 'johnsnow',
					password 	: passwordHash.generate('Tenupu11'),
					activated	: true
				});
				user.save(function(err){
					if (err) throw new Error('failed to reset db');
					done();
				});
			});
		});
	});

	after(function(done) {
		mongoose.connection.close();
		done();
	});

	describe('qFind()', function() {

		it('should return all query users', function(done) {
			User.qFind({})
			.then(function(users) {
				expect(users).to.have.length.above(0);
				done();
			});
		});

	});

	describe('qFindOne', function() {

		it('should return queried user', function(done) {
			User.qFindOne({username:"johnsnow"})
			.then(function(user) {
				expect(user.username).to.equal('johnsnow');
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
	});

	describe('qFindUsername', function() {

		it('should return queried user', function(done) {
			User.qFindByUsername('johnsnow')
			.then(function(user) {
				expect(user.username).to.equal('johnsnow');
				done();
			});
		});
	});
});