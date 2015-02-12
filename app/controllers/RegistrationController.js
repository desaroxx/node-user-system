'use strict';

var passwordHash = require('password-hash');
var util = require('util');

var User = require('./../model/User');
var Activator = require('./../services/Activator');
var Mailer = require('./../services/Mailer');

var secret = require('./../../config/secret');
var mailConfig = require('./../../config/mail');

/*
 * Task: Check if username or email is free
 */
module.exports.isFree = function(req, res) {
	// input validation
	req.checkQuery('email', 'invalid email').notEmpty().isEmail();
	req.checkQuery('username', 'invalid username').notEmpty().isUsername();

	// prepare db query
	var queryParameters = {
		'email': req.query.email,
		'username': req.query.username
	};

	// remove bad parameters from query
	var errors = req.validationErrors();
	errors.forEach(function(error) {
		if (error.param in queryParameters) delete queryParameters[error.param];
	});

	// check if still has some queryParameters
	if(Object.keys(queryParameters).length < 1) {
		return res.status(400).json({ 'message': 'invalid parameters'});
	}

	// execute find
	User.qFindOne(queryParameters)
	.then(function(user) {
		if (user) return res.send({ isFree:false});
		return res.send({ isFree:true});
	})
	.catch(function(err) {
		return res.status(500).json({ 'message': 'internal db error'});
	});
};

/*
 * Task: Create new user
 */
 module.exports.createUser = function(req, res) {
 	// input validation
	req.checkBody('email', 'invalid email').notEmpty().isEmail();
	req.checkBody('username', 'invalid username').notEmpty().isUsername();
	req.checkBody('password', 'invalid password').notEmpty().isPassword();

	// input error handling
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({ message: 'There have been validation errors', errors:errors});
	}

	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;

	// let off here
	// check if username and email unique
	var query = { $or:[ {email: email}, {username: username}]};
	User.qFindOne(query)
	.then(function(user) {
		// check if user already exists
		if (user != null) {
			res.status(400).json({ message: 'email or username already exists'});
			throw new Error('email or username already exists');
		}
	})
	.then(function() {
		// create new user
		var user = new User({
			email 				: email,
			username 			: username,
			lowercaseUsername	: username,
			password 			: passwordHash.generate(password)
		});

		user.qSave()
		.then(function() {
			console.log('emailing');
			// send activation email

			// generate activation token
			var token = Activator.generateToken(user, secret.activationKey);

			// prepare email
			var email = {
				from: 'skeleton <notifications@desaroxx.com>', // sender address
			    to: user.email, // list of receivers
			    subject: 'Account activation', // Subject line
			    text: token, // plaintext body
			    html: token // html body
			};

			// send email
			Mailer.sendMail(email, mailConfig.smtpSettings);

			return res.json({ message: 'User created!'});
		})
		.catch(function(err) {
			if(err) return res.status(500).json({ message: 'internal db error (2)'});
		});
	})
	.catch(function(err) {
		return res.status(500).json({ message: err});
	});
 };