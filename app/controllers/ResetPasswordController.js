'use strict';

var passwordHash = require('password-hash');
var util = require('util');

var User = require('./../model/User');
var PasswordResetter = require('./../services/PasswordResetter');
var Mailer = require('./../services/Mailer');

var secret = require('./../../config/secret');
var mailConfig = require('./../../config/mail');

/*
 * Task: Send password reset email
 */
module.exports.sendEmail = function(req, res) {
	// input validation
	req.checkBody('email', 'invalid email').notEmpty().isEmail();

	// input error handling
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({ message: 'There have been validation errors: ' + util.inspect(errors)});
	}

	// check if user exists
	var email = req.body.email;
	var query = {email: email};
	User.findOne(query, function(err, user) {
		if (err) return res.status(500).json({ message: 'internal db error (0)'});
		if (!user) return res.status(400).json({ message: 'inexistant email'});

		// generate password-reset token
		var token = PasswordResetter.generateToken(user.email, secret.activationKey);

		// prepare email
		var email = {
			from: 'skeleton <notifications@desaroxx.com>', // sender address
		    to: user.email, // list of receivers
		    subject: 'Reset password', // Subject line
		    text: token, // plaintext body
		    html: token // html body
		};

		// send email
		Mailer.sendMail(email, mailConfig.smtpSettings);

		res.json({ message: 'password-reset email sent to: ' + user.email});
	});
};

/*
 * Task: Update password
 */
 module.exports.resetPassword = function(req, res) {
 	// input validation
	req.checkBody('password', 'invalid password').notEmpty().isPassword();

	// input error handling
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({ message: 'There have been validation errors: ' + util.inspect(errors)});
	}

	var password = req.body.password;
	var token = req.body.token;

	// get email from token
	var email = PasswordResetter.verfiyAndGetEmail(token, secret.activationKey);
	if (!email) {
		return res.status(400).json({ message: 'invalid "token"'});
	}

	// activate user in db
	var hashedPassword = passwordHash.generate(password);
	var query = {email: email};
	var update = {password: hashedPassword};
	var options = {};
	User.findOneAndUpdate(query, update, options, function(err, updatedUser) {
		if (err) {
			return res.status(500).json({ message: 'internal db error (0)'});
		}
		return res.json({ message: 'new password set for: ' + updatedUser.email });
	});
 };