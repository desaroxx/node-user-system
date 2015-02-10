'use strict';

var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var Q = require('q');

var User = require('./../model/User');
var secret = require('./../../config/secret');
var Authenticator = require('./../utilities/Authenticator');

/*
 * Task: Return user information
 */
module.exports.getUserDetails = function(req, res) {
	// input validation
	req.checkParams('username', 'invalid username').notEmpty().isUsername();

	// set user if user is logged in
	if (req.headers.authorization) {
		var token = req.headers.authorization.split(' ')[1];
		req.user = Authenticator.getUser(token, secret.key);
	}

	// authorize
	var isAuthorized = false;
	if (req.user && (req.user.username.toLowerCase() == req.params.username.toLowerCase())) {
		isAuthorized = true;
	}

	// prepare query from parameters
	var query = {username: req.params.username.toLowerCase()};

	// find user in database
	User.qFindOne(query)
	.then(function(user) {
		if (!user) return res.status(400).json({ message: 'username does not exist'});
		
		var returnJSON = {};
		returnJSON.username = user.username;
		returnJSON._id = user._id;

		if (isAuthorized) returnJSON.email = user.email;
		res.json(returnJSON);
	})
	.catch(function(err) {
		if (err) res.status(500).json({ message: 'internal server error (0)'});
	});
};

/*
 * Task: Update user information
 */
module.exports.updateUserDetails = function(req, res) {
	// input validation
	if (!req.params.username && typeof req.params.username !== 'string') {
		return res.status(400).json({ message: 'URL parameter "username" is missing in request'});
	}

	// authorize
	if (req.user.username.toLowerCase() != req.params.username.toLowerCase()) {
		return res.status(403).json({ message: 'forbidden to update requested user'});
	}

	// input validation
	req.checkBody('email', 'invalid email').notEmpty().isEmail();
	req.checkBody('username', 'invalid username').notEmpty().isUsername();
	req.checkBody('password', 'invalid password').notEmpty().isPassword();

	// prepare update for db
	var update = {
		'email':  req.body.email,
		'username': req.body.username,
		'password': 'dummy'
	};

	// remove invalid parameters
	var errors = req.validationErrors();
	errors.forEach(function(error) {
		if (error.param in update) delete update[error.param];
	});

	// check if still has some parameters
	if(Object.keys(update).length < 1) {
		return res.status(400).json({ message: 'no parameters to update'});
	}

	// if password is in update, then hash it
	if ('password' in update) update.password = passwordHash.generate(req.body.password);

	// update user to db
	var query = {
		username: req.params.username.toLowerCase()
	};
	
	// function: check if username is free
	var isUsernameFree = function() {
		var deferred = Q.defer();
		if ('username' in update) {
			User.qFindOne({username:update.username.toLowerCase()})
			.then(function(user) {
				if (user) return res.status(400).json({ message: 'username taken'});
				deferred.resolve();
			});
		} else {
			deferred.resolve();
		}
		return deferred.promise;
	}

	// function: check if email is free
	var isEmailFree = function() {
		var deferred = Q.defer();
		if ('email' in update) {
			User.qFindOne({username:update.email.toLowerCase()})
			.then(function(user) {
				if (user) return res.status(400).json({ message: 'email taken'});
				deferred.resolve();
			});
		} else {
			deferred.resolve();
		}
		return deferred.promise;
	};

	// barriere: wait till both checks are done: isEmailFree and isUsernameFree
	Q.all([isUsernameFree(), isEmailFree()])
	.then(function() {
		User.findOneAndUpdate(query, update, {}, function(err, user) {
			if (err) return res.status(500).json({ message: 'internal server error (0)'});
			if (!user) return res.status(400).json({ message: 'username does not exist exists'});

			var returnJSON = {
				'email': user.email,
				'username': user.username,
				'_id': user._id
			};

			// if username or email update, then return new token
			if (('username' in update) || ('email' in update)) {
				returnJSON.token = jwt.sign(
					{
						email 	 	: user.email, 
						_id		 	: user._id, 
						username 	: user.username
					},
					secret.key);
			}
			return res.json(returnJSON);
		});
	});
};