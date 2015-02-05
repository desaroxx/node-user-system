var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');

var User = require('./../model/User');
var secret = require('./../../config/secret');
var Validator = require('./../utilities/Validator');
var Authentication = require('./../utilities/Authentication');

module.exports = function(app, passport) {

	app.route('/api/users/:user_id')

		/*
		 * Task: Return user information
		 */
		.get(function(req, res) {
			console.log('GET users/:user_id called');

			// set user if user is logged in
			if (req.headers.authorization) {
				var token = req.headers.authorization.split(' ')[1];
				req.user = Authentication.getUser(token);
			}

			// authorize
			var isAuthorized = false;
			if (req.user && (req.params.user_id==req.user._id)) {
				isAuthorized = true;
			}

			User.findById(req.params.user_id, function(err, user) {
				if (err) {
					res.send(err);
				}
				if (!user) {
					return res.status(400).json({ message: 'inexistant "user_id"'});
				}
				var returnJSON = {};
				returnJSON.username = user.username;
				returnJSON._id = user._id;

				if (isAuthorized) {
					returnJSON.email = user.email;
				}
				res.json(returnJSON);
			});
		})

		/*
		 * Task: Update user information
		 */
		.put(passport.authenticate('jwt-bearer', { session: false }), function(req, res) {
			console.log('PUT users/:user_id called');

			// user_id in URL is set
			var URLUserId = req.params.user_id;
			if (!URLUserId && typeof URLUserId !== 'string') {
				return res.status(400).json({ message: 'URL parameter "user_id" is missing in request'});
			}

			// authorize
			if (req.user._id != URLUserId) {
				return res.status(403).json({ message: 'forbidden to update requested user'});
			}

			// extract parameters from HTTP body
			var email = req.body.email;
			var username = req.body.username;
			var password = req.body.password;

			// check: at least 1 parameter set
			var parameterCounter = 0;
			var parameters = [];

			if ((email) && (typeof email === 'string')) {
				parameterCounter++;
				parameters.push('email');
			}
			if ((username) && (typeof username === 'string')) {
				parameterCounter++;
				parameters.push('username');
			}
			if ((password) && (typeof password === 'string')) {
				parameterCounter++;
				parameters.push('password');
			}
			if (parameterCounter < 1) {
				return res.status(400).json({ message: 'no update parameters set: email, username, password'});
			}

			// check: valid parameter format
			parameters.forEach(function(parameter) {
				if (parameter === 'email' && !Validator.isValidEmailFormat(email)) {
					return res.status(400).json({ message: 'invalid email format'});
				}
				if (parameter === 'username' && !Validator.isValidUsernameFormat(username)) {
					return res.status(400).json({ message: 'invalid username format'});
				}
				if (parameter === 'password' && !Validator.isValidPasswordFormat(password)) {
					return res.status(400).json({ message: 'invalid password format'});
				}
			});

			// update user to db
			User.findById(req.user._id, function (err, updatingUser) {
				if (err) return res.status(500),json({ message: 'internal server error (0)'});

				// update all parameters
				parameters.forEach(function(parameter) {
					switch(parameter) {
						case 'email':
							updatingUser.email = email;
							break;
						case 'username':
							updatingUser.username = username;
							break;
						case 'password':
							updatingUser.password = passwordHash.generate(password);
							break;
					}
				});

				// save to db
				updatingUser.save(function (err) {
					if (err) return res.status(500),json({ message: 'internal server error (1)'});
					var returnJSON = {};
					returnJSON.username = updatingUser.username;
					returnJSON.email = updatingUser.email;
					returnJSON._id = updatingUser._id;
					return res.json(returnJSON);
				});
			});
		});
};