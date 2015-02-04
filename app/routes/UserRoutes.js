var jwt = require('jsonwebtoken');

var User = require('./../model/User');
var secret = require('./../../config/secret');
var Validator = require('./../utilities/Validator');

module.exports = function(app, passport) {

	app.route('/api/users')
		// GET
		.get(function(req, res) {
			User.find({}, function(err, users) {
				var JSONReturn = {};
				JSONReturn.users = users;
				res.json(JSONReturn);
			});
		});

	app.route('/api/users/:user_id')
		// GET
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) {
					res.send(err);
				}
				res.json(user);
			});
		})
		// PUT
		// .put(passport.authenticate('jwt-bearer', { session: false }), function(req, res) {
		// 	// input validation
		// 	if (!req.params.user_id) {
		// 		return res.status(400).json({ message: 'Parameter "user_id" is missing in request.'});
		// 	}

		// 	// authorize
		// 	if (req.user._id != req.params.user_id) {
		// 		return res.status(403).json({ message: 'Insufficient authorization to change user data.'});
		// 	}


		// });
		// DELETE
		.delete(passport.authenticate('jwt-bearer', { session: false }), function(req, res) {

			// input validation
			if (!req.params.user_id) {
				return res.status(400).json({ message: 'Parameter "user_id" is missing in request.'});
			}

			// authorize
			if (req.user._id != req.params.user_id) {
				return res.status(403).json({ message: 'Insufficient authorization to delete user.'});
			}

			// remove user from database
			User.remove({
				_id: req.params.user_id
			}, function(err, user) {
				if (err) {
					return res.send(err);
				}
				return res.json({ message: 'Successfully deleted'});
			})
		});

	app.route('/api/login')
		// POST
		.post(function(req, res) {
			console.log('POST /login called');

			// input validation
			if (!('email' in req.body) || !('password' in req.body)) {
				return res.status(401).json({ error: 'Invalid credentials. (0)'});
			}
			var email = req.body.email.toLowerCase();
			var password = req.body.password;

			User.findOne({email: email}, function(err, user) {
				if (err) {
					return res.status(500).json({ error: 'Internal server error.'});
				}
				if (!user) {
					return res.status(401).json({ error: 'Invalid credentials. (1)'});
				}
				if (!(password === user.password)) {
					return res.status(401).json({ error: 'Invalid credentials. (2)'});			
				}

				var token = jwt.sign({email:user.email, _id: user._id}, secret.key);
				return res.json({ 
					token: token,
					user_id: user._id,
					email: user.email
				});
			});
		});

	app.route('/api/register')
		.get(function(req, res) {
			console.log('GET /register called');

			// validate input
			if ((!req.query.email) || (typeof req.query.email !== 'string')) {
				return res.status(400).json({ message: 'bad parameters (0)'});
			}

			if (!Validator.validEmailFormat(req.query.email)) {
				return res.status(400).json({ error: 'bad parameters (1)'});
			}

			var email = req.query.email;
			User.find({email: email}, function(err, users) {
				if (err) {
					return res.status(500).json({ message: 'db error'});
				}
				if (users.length > 0) {
					return res.json({ emailIsFree: false});
				} else {
					return res.json({ emailIsFree: true});
				}

			});
		})
		.post(function(req, res) {
			console.log('POST /register called');

			// input validation

			var user = new User();
			user.email = req.body.email;
			user.password = req.body.password;

			user.save(function(err) {
				if (err) {
					res.send(err);
				}
				res.json({ message: 'User created!'});
			});

		});


	app.route('/api/logout')
		.post(passport.authenticate('jwt-bearer', { session: false }), function(req, res) {
			// TODO: implement

			// input validation

			// authorize
			if (req.user._id != req.params.user_id) {
				return res.status(403).json({ message: 'Insufficient authorization to delete resource.'});
			}

			// invalidate token

		});

};