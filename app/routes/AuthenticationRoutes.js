'use strict';

var AuthenticationController = require('./../controllers/AuthenticationController');
var RegistrationController = require('./../controllers/RegistrationController');
var ActivationController = require('./../controllers/ActivationController');
var ResetPasswordController = require('./../controllers/ResetPasswordController');

module.exports = function(app, passport) {

	app.route('/api/auth')
		.post(function(req, res) {
			AuthenticationController.authenticate(req, res);
		});

	app.route('/api/register')
		.get(function(req, res) {
			RegistrationController.isFree(req, res);
		})
		.post(function(req, res) {
			RegistrationController.createUser(req, res);
		});

	app.route('/api/activate')
		.post(function(req, res) {
			ActivationController.resendEmail(req, res);
		})
		.put(function(req, res) {
			ActivationController.activate(req, res);
		});

	app.route('/api/reset-password')
		.post(function(req, res) {
			ResetPasswordController.sendEmail(req, res);
		})
		.put(function(req, res) {
			ResetPasswordController.resetPassword(req, res);
		});
		
};