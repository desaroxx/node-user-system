var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');

var User = require('./../model/User');
var secret = require('./../../config/secret');
var Validator = require('./../utilities/Validator');

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
			if (!Validator.isValidEmailFormat(req.body.email)) {
				return res.status(400).json({ error: 'bad parameters: email bad format'});
			}

			var email = req.body.email.toLowerCase();
			var password = req.body.password;

			User.findOne({email: email}, function(err, user) {
				if (err) {
					return res.status(500).json({ error: 'internal server error'});
				}
				if (!user) {
					return res.status(401).json({ error: 'invalid credentials'});
				}
				if (!passwordHash.verify(password, user.password)) {
					return res.status(401).json({ error: 'invalid credentials'});			
				}

				var token = jwt.sign(
					{
						email 	 : user.email, 
						_id		 : user._id, 
						username : user.username
					},
					secret.key);
				return res.json({ 
					token: token,
					user_id: user._id,
					email: user.email,
					username: user.username
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
			if (parameter === 'email' && !Validator.isValidEmailFormat(req.query.email)) {
				return res.status(400).json({ message: 'invalid email format'});
			}
			if (parameter === 'username' && !Validator.isValidUsernameFormat(req.query.username)) {
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
			if (!Validator.isValidEmailFormat(req.body.email)) {
				return res.status(400).json({ error: 'bad parameters: bad email format'});
			}
			if (!Validator.isValidUsernameFormat(req.body.username)) {
				return res.status(400).json({ error: 'bad parameters: bad username format'});
			}
			if (!Validator.isValidPasswordFormat(req.body.password)) {
				return res.status(400).json({ error: 'bad parameters: bad password format'});
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
					// TODO: implement hashing + salting
					newUser.password = passwordHash.generate(req.body.password);

					newUser.save(function(err) {
						if(err) return res.status(500).json({ message: 'internal db error (2)'});
						return res.json({ message: 'User created!'});
					});
				}
			);
		});

};