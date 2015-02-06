'use strict';

var util = require('util');

var User = require('./../model/User');
var Activator = require('./../services/Activator');
var Mailer = require('./../services/Mailer');

var secret = require('./../../config/secret');
var mailConfig = require('./../../config/mail');

/*
 * Task: Resend activation email
 */
module.exports.resendEmail = function(req, res) {
	// input validation
	req.checkBody('email', 'invalid email').notEmpty().isEmail();

	// input error handling
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({ message: 'There have been validation errors: ' + util.inspect(errors)});
	}

	var email = req.body.email;

	// check if user already exists
	var query = {email: email};
	User.findOne(query, function(err, user) {
		if (err) return res.status(500).json({ message: 'internal db error (0)'});
		if (!user) return res.status(400).json({ message: 'invalid email (1)'});
		if (user.activated) return res.status(400).json({ message: 'user already activated'});

		// generate activation token
		var token = Activator.generateToken(user, secret.activationKey);

		// prepare email
		var email = {
			from: 'skeleton <notifications@desaroxx.com>', // sender address
		    to: user.email, // list of receivers
		    subject: 'Account activation', // Subject line
		    text: token, // plaintext body
		    html: token // html body
		}

		// send email
		Mailer.sendMail(email, mailConfig.smtpSettings);

		return res.json({ message: "activation resent to: " + user.email});
	});
};

/*
 * Task: Activate user
 */
module.exports.activate = function(req, res) {
	// input validation
	req.checkBody('token', 'invalid token').notEmpty();

	// input error handling
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({ message: 'There have been validation errors: ' + util.inspect(errors)});
	}

	// get user from token
	var user = Activator.verfiyAndGetUser(token, secret.activationKey);
	if (!user) {
		return res.status(400).json({ message: 'invalid activation token'});
	}

	// activate user in db
	var query = {email: user.email};
	var update = {activated: true};
	var options = {};
	User.findOneAndUpdate(query, update, options, function(err, updatedUser) {
		if (err) {
			return res.status(500).json({ message: 'internal db error (2)'});
		}
		return res.json({ message: 'activated: ' + updatedUser.username });
	});
};