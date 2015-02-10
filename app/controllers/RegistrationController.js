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
	User.find(queryParameters, function(err, users) {
		if (err) {
			return res.status(500).json({ 'message': 'internal db error'});
		}
		if (users.length > 0) {
			return res.send({ isFree:false});
		} else {
			return res.send({ isFree:true});
		}
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

	// check if username and email unique
	User.findOne({ $or:[ {'email': email}, {'username': username}]}, 
	 	function(err,user){
	    	if(err) return res.status(500).json({ message: 'internal db error (1)'});
	    	if (user != null) {
	    		return res.status(400).json({ message: 'email or username already exists'});
	    	}

	    	// create new user
	    	var newUser = new User();
			newUser.email = email.toLowerCase();
			newUser.username = username;
			newUser.password = passwordHash.generate(password);

			newUser.save(function(err) {
				if(err) return res.status(500).json({ message: 'internal db error (2)'});

				// send activation email

				// generate activation token
				var token = Activator.generateToken(newUser, secret.activationKey);

				// prepare email
				var email = {
					from: 'skeleton <notifications@desaroxx.com>', // sender address
				    to: newUser.email, // list of receivers
				    subject: 'Account activation', // Subject line
				    text: token, // plaintext body
				    html: token // html body
				}

				// send email
				Mailer.sendMail(email, mailConfig.smtpSettings);

				return res.json({ message: 'User created!'});
			});
		}
	);
 };