'use strict';

var expect 			= require('chai').expect;
var mongoose 		= require('mongoose');
var passwordHash 	= require('password-hash');

var rootPath 		= './../../../'
var User 			= require(rootPath + 'app/model/User');
var db 				= require(rootPath + 'config/db');

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

	describe('test', function() {

		it('test', function(done) {
			done();
		});

	});

	
});