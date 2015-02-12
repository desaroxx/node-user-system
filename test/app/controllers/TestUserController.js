// 'use strict';

// var expect = require('chai').expect;
// var request = require('request');
// var jwt = require('jsonwebtoken');
// var passwordHash = require('password-hash');
// var mongoose = require('mongoose');

// var UserController = require('./../../../app/controllers/UserController');
// var User = require('./../../../app/model/User');
// var db = require('./../../../config/db');

// var secret = require('./../../../config/secret');

// describe('Test: UserRoutes', function() {

// 	before(function(done) {
		
// 		mongoose.connect(db.url);
// 		mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
// 		mongoose.connection.once('open', function (callback) {
// 			// reset test user: john@snow.com

// 			// delete user
// 			var query = { $or:[ {email:'john@snow.com'}, {'username':'johnsnow'} ]};
// 			User.findOneAndRemove(query, function(err) {

// 				// create user
// 				var user = new User({
// 					email				: 'john@snow.com',
// 					username 			: 'johnsnow',
// 					lowercaseUsername 	: 'johnsnow',
// 					password 			: passwordHash.generate('Tenupu11'),
// 					activated			: true
// 				});
// 				user.save(function(err){
// 					if (err) throw new Error('failed to reset db');
// 					done();
// 				});
// 			});
// 		});
// 	});

// 	after(function(done) {
// 		// reset test user: john@snow.com

// 		// delete user
// 		var query = { $or:[ {email:'john@snow.com'}, {'username':'johnsnow'} ]};
// 		User.findOneAndRemove(query, function(err) {

// 			// create user
// 			var user = new User({
// 				email				: 'john@snow.com',
// 				username 			: 'johnsnow',
// 				lowercaseUsername 	: 'johnsnow',mocah
// 				password 			: passwordHash.generate('Tenupu11'),
// 				activated			: true
// 			});	
// 			user.save(function(err){
// 				if (err) throw new Error('failed to reset db');
// 				mongoose.connection.close();
// 				done();
// 			});
// 		});
// 	});

// 	// describe('isUsernameFree(username)', function() {

// 	// 	it('should return true if username is free', function(done) {
// 	// 		UserController.isUsernameFree('something')
// 	// 		.then(function(isFree) {
// 	// 			expect(isFree).to.be.true;
// 	// 			done();
// 	// 		});
// 	// 	});

// 	// 	it('should return false if username is taken', function(done) {
// 	// 		UserController.isUsernameFree('johnsnow')
// 	// 		.then(function(isFree) {
// 	// 			expect(isFree).to.be.false;
// 	// 			done();
// 	// 		});
// 	// 	});
// 	// });

// 	// describe('isEmailFree(email)', function() {

// 	// 	it('should return true if email is free', function(done) {
// 	// 		UserController.isEmailFree('something@someone.com')
// 	// 		.then(function(isFree) {
// 	// 			expect(isFree).to.be.true;
// 	// 			done();
// 	// 		});
// 	// 	});

// 	// 	it('should return false if email is taken', function(done) {
// 	// 		UserController.isEmailFree('john@snow.com')
// 	// 		.then(function(isFree) {
// 	// 			expect(isFree).to.be.false;
// 	// 			done();
// 	// 		});
// 	// 	});
// 	// });
// });