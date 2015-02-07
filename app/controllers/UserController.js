'use strict';

var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');

var User = require('./../model/User');
var secret = require('./../../config/secret');
var Authenticator = require('./../utilities/Authenticator');

/*
 * Task: Return user information
 */
module.exports.getUserDetails = function(req, res) {
	// set user if user is logged in
	if (req.headers.authorization) {
		var token = req.headers.authorization.split(' ')[1];
		req.user = Authenticator.getUser(token, secret.key);
	}

	// authorize
	var isAuthorized = false;
	if (req.user && (req.params.user_id==req.user._id)) {
		isAuthorized = true;
	}

	User.findById(req.params.user_id, function(err, user) {
		if (err) res.status(500).json({ message: 'internal server error (0)'});
		if (!user) return res.status(400).json({ message: 'inexistant "user_id"'});
		
		var returnJSON = {};
		returnJSON.username = user.username;
		returnJSON._id = user._id;

		if (isAuthorized) returnJSON.email = user.email;
		res.json(returnJSON);
	});
};

/*
 * Task: Update user information
 */
module.exports.updateUserDetails = function(req, res) {
	// input validation
	if (!req.params.user_id && typeof req.params.user_id !== 'string') {
		return res.status(400).json({ message: 'URL parameter "user_id" is missing in request'});
	}

	// authorize
	if (req.user._id != req.params.user_id) {
		return res.status(403).json({ message: 'forbidden to update requested user'});
	}

	// input validation
	req.checkBody('email', 'invalid email').notEmpty().isEmail();
	req.checkBody('username', 'invalid username').notEmpty().isUsername();
	req.checkBody('password', 'invalid password').notEmpty().isPassword();

	// prepare db
	var update = {
		'email':  req.body.email,
		'username': req.body.username,
		'password': password
	};

	// remove invalid parameters
	var errors = req.validationErrors();
	errors.forEach(function(error) {
		if (error.param in updates) delete updates[error.param];
	});

	// check if still has some parameters
	if(Object.keys(updates).length < 1) {
		return res.status(400).json({ message: 'invalid parameters'});
	}

	// if password is in update, then hash it
	if ('password' in update) update.password = passwordHash.generate(req.body.password);

	// update user to db
	User.findByIdAndUpdate(req.params.user_id, update, {}, function(err, user) {
		if (err) return res.status(500).json({ message: 'internal server error (0)'});
		if (!user) return res.status(400).json({ message: 'invalid user_id'});
		return res.json({
			'email': user.email,
			'username': user.username
		});
	});
};