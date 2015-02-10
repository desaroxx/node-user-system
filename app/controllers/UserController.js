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
	User.findOne(query, function(err, user) {
		if (err) res.status(500).json({ message: 'internal server error (0)'});
		if (!user) return res.status(400).json({ message: 'username does not exist'});
		
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

	// prepare db
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
	}

	console.log('query');
	console.log(query);
	User.findOneAndUpdate(query, update, {}, function(err, user) {
		if (err) return res.status(500).json({ message: 'internal server error (0)'});
		if (!user) return res.status(400).json({ message: 'invalid username'});

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
};