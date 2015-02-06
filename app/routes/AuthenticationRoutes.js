'use strict';

var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');

var User = require('./../model/User');
var FormatValidator = require('./../utilities/FormatValidator');
var Activator = require('./../services/Activator');
var PasswordResetter = require('./../services/PasswordResetter');
var Mailer = require('./../services/Mailer');

var secret = require('./../../config/secret');
var mailConfig = require('./../../config/mail');

module.exports = function(app, passport) {

	app.route('/api/auth')
		/*
		 * Task: Authenticate to get auth token
		 * Specification:
		 * o Token expiry: never
		 */
		.post(function(req, res) {
			console.log('POST /login called');

			// input validation

			// check: body-parameter set
			if ((!req.body.email) || (typeof req.body.email !== 'string')) {
				return res.status(400).json({ message: 'bad parameters: email missing'});
			}
			if ((!req.body.password) || (typeof req.body.password !== 'string')) {
				return res.status(400).json({ message: 'bad parameters: password missing'});
			}

			// check: valid format
			if (!FormatValidator.isValidEmailFormat(req.body.email)) {
				return res.status(400).json({ message: 'bad parameters: email bad format'});
			}

			var email = req.body.email.toLowerCase();
			var password = req.body.password;

			User.findOne({email: email}, function(err, user) {
				if (err) {
					return res.status(500).json({ message: 'internal server error'});
				}
				if (!user) {
					return res.status(401).json({ message: 'invalid credentials'});
				}
				if (!passwordHash.verify(password, user.password)) {
					return res.status(401).json({ message: 'invalid credentials'});			
				}

				// check is user is activated
				if (!user.activated) {
					return res.status(401).json({ message: 'account not activated'});
				}

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
			});
		});

	app.route('/api/register')

		/*
		 * Task: Check if username or email is free
		 */
		.get(function(req, res) {
			console.log('GET /register called');

			// input validation

			// check: at least 1 parameter set
			var parameterCounter = 0;
			var parameter;

			if ((req.query.email) && (typeof req.query.email === 'string')) {
				parameterCounter++;
				parameter = 'email';
			}
			if ((req.query.username) && (typeof req.query.username === 'string')) {
				parameterCounter++;
				parameter = 'username';
			}
			if (parameterCounter < 1) {
				return res.status(400).json({ message: 'no query parameters set: email, username'});
			} else if(parameterCounter > 1){
				return res.status(400).json({ message: 'too many parameters set'});
			}

			// check: valid parameter format
			if (parameter === 'email' && !FormatValidator.isValidEmailFormat(req.query.email)) {
				return res.status(400).json({ message: 'invalid email format'});
			}
			if (parameter === 'username' && !FormatValidator.isValidUsernameFormat(req.query.username)) {
				return res.status(400).json({ message: 'invalid username format'});
			}

			// prepare db query
			var queryParameters = {};
			switch (parameter) {
				case 'email':
					queryParameters.email = req.query.email;
					break;
				case 'username':
					queryParameters.username = req.query.username;
					break;
			}

			// execute find
			User.find(queryParameters, function(err, users) {
				if (err) {
					return res.status(500).json({ message: 'internal db error'});
				}
				if (users.length > 0) {
					return res.json({ isFree: false});
				} else {
					return res.json({ isFree: true});
				}
			});
		})

		/*
		 * Task: Create new user
		 */
		.post(function(req, res) {
			console.log('POST /register called');

			// input validation

			// check: body-parameter set
			if ((!req.body.email) || (typeof req.body.email !== 'string')) {
				return res.status(400).json({ message: 'bad parameters: email missing'});
			}
			if ((!req.body.username) || (typeof req.body.username !== 'string')) {
				return res.status(400).json({ message: 'bad parameters: username missing'});
			}
			if ((!req.body.password) || (typeof req.body.password !== 'string')) {
				return res.status(400).json({ message: 'bad parameters: password missing'});
			}

			// check: valid format
			if (!FormatValidator.isValidEmailFormat(req.body.email)) {
				return res.status(400).json({ message: 'bad parameters: bad email format'});
			}
			if (!FormatValidator.isValidUsernameFormat(req.body.username)) {
				return res.status(400).json({ message: 'bad parameters: bad username format'});
			}
			if (!FormatValidator.isValidPasswordFormat(req.body.password)) {
				return res.status(400).json({ message: 'bad parameters: bad password format'});
			}

			// check if username and email unique
			User.findOne({ $or:[ {'email': req.body.email}, {'username': req.body.username}]}, 
			 	function(err,user){
			    	if(err) return res.status(500).json({ message: 'internal db error (1)'});
			    	if (user != null) {
			    		return res.status(400).json({ message: 'email or username already exists'});
			    	}

			    	// create new user
			    	var newUser = new User();
					newUser.email = req.body.email.toLowerCase();
					newUser.username = req.body.username;
					newUser.password = passwordHash.generate(req.body.password);

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
		});

	app.route('/api/activate')
		/*
		 * Task: Resend activation email
		 */
		.get(function(req, res) {
			console.log('GET /api/activate');

			var email = req.query.email;

			// input validation

			// check: parameter set
			if ((!email) || (typeof email !== 'string')) {
				return res.status(400).json({ message: 'bad parameters: email missing'});
			}
			// check: valid format
			if (!FormatValidator.isValidEmailFormat(email)) {
				return res.status(400).json({ message: 'bad parameters: bad email format'});
			}


			var query = {email: email};
			User.findOne(query, function(err, user) {
				if (err) return res.status(500).json({ message: 'internal db error (0)'});
				if (!user) return res.status(400).json({ message: 'invalid email'});
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

		})

		/*
		 * Task: Activate user
		 */
		.put(function(req, res) {
			console.log('PUT /api/activate');
			// input validation

			// check: body-parameter set
			var token = req.body.token;
			if ((!token) || (typeof token !== 'string')) {
				return res.status(400).json({ message: 'bad parameters: url-parameter "token" missing'});
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
		});

	app.route('/api/reset-password')

		/*
		 * Task: Send password reset email
		 */
		.post(function(req, res) {
			var email = req.body.email;

			// input validation

			// check: parameter set
			if ((!email) || (typeof email !== 'string')) {
				return res.status(400).json({ message: 'bad parameters: email missing'});
			}
			// check: valid format
			if (!FormatValidator.isValidEmailFormat(email)) {
				return res.status(400).json({ message: 'bad parameters: bad email format'});
			}

			// check if user exists
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
		})

		/*
		 * Task: Update password
		 */
		.put(function(req, res) {
			var password = req.body.password;
			var token = req.body.token;
			
			// input validation

			// check: parameter set
			if ((!password) || (typeof password !== 'string')) {
				return res.status(400).json({ message: 'bad parameters: parameter "password" missing'});
			}

			// check: valid format
			if (!FormatValidator.isValidPasswordFormat(req.body.password)) {
				return res.status(400).json({ message: 'bad "password" format'});
			}

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

		});
};