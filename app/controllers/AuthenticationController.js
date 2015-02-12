'use strict';

var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');
var util = require('util');

var User = require('./../model/User');

var secret = require('./../../config/secret');

/*
 * Task: Authenticate to get auth token
 * Specification:
 * o Token expiry: never
 */
module.exports.authenticate = function(req, res) {
	// input validation
	req.checkBody('email', 'invalid email').notEmpty().isEmail();
	req.checkBody('password', 'invalid password').notEmpty();

	// input error handling
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({ message: 'There have been validation errors: ' + util.inspect(errors)});
	}

	User.qFindByEmail(req.body.email)
	.then(function(user) {
		if (!user) return res.status(401).json({ message: 'invalid credentials'});
		if (!passwordHash.verify(req.body.password, user.password)) return res.status(401).json({ message: 'invalid credentials'});

		// check is user is activated
		if (!user.activated) {
			return res.status(401).json({ message: 'account not activated'});
		}

		// create token
		var token = jwt.sign(
			{
				email 	 	: user.email, 
				_id		 	: user._id, 
				username 	: user.username
			},
			secret.key);
		return res.json({ 
			token 			: token,
			user_id 		: user._id,
			email 			: user.email,
			username 		: user.username
		});
	})
	.catch(function(err) {
		return res.status(500).json({ message:err.message});
	});
};