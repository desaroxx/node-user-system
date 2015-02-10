'use strict';

var UserController = require('./../controllers/UserController');

module.exports = function(app, passport) {

	app.route('/api/users/:username')
		.get(function(req, res) {
			UserController.getUserDetails(req, res);
		})
		.put(passport.authenticate('jwt-bearer', { session: false }), function(req, res) {
			UserController.updateUserDetails(req, res);
		});
		
};