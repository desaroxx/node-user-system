'use strict';

var AuthenticationController = require('./../controllers/AuthenticationController');
var RegistrationController = require('./../controllers/RegistrationController');
var ActivationController = require('./../controllers/ActivationController');
var ResetPasswordController = require('./../controllers/ResetPasswordController');

module.exports = function(app, passport) {

	app.route('/api/auth')
		// authenticate user
		.post(function(req, res) {
			AuthenticationController.authenticate(req, res);
		});

	app.route('/api/register')
		// is username or email unused
		.get(function(req, res) {
			RegistrationController.isFree(req, res);
		})
		// create new user
		.post(function(req, res) {
			RegistrationController.createUser(req, res);
		});

	app.route('/api/activate')
		// resend activiation email
		.post(function(req, res) {
			ActivationController.resendEmail(req, res);
		})
		// activate user
		.put(function(req, res) {
			ActivationController.activate(req, res);
		});

	app.route('/api/reset-password')
		// send password reset email
		.post(function(req, res) {
			ResetPasswordController.sendEmail(req, res);
		})
		// reset password
		.put(function(req, res) {
			ResetPasswordController.resetPassword(req, res);
		});
		
};