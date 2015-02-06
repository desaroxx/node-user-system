'use strict';

var expect = require('chai').expect;

var Mailer = require('./../../../app/services/Mailer');

var mailConfig = require('./../../../config/mail');

describe('TestMailer', function() {

	describe('sendMail()', function() {
		this.timeout(6000);

		var smtpSettings = mailConfig.smtpSettings;

		it('should send emails with success confirmation', function(done) {
			var email = {
			    from: 'skeleton <notifications@desaroxx.com>', // sender address
			    to: 'kenosteiner+nodemailer@gmail.com', // list of receivers
			    subject: 'Hello', // Subject line
			    text: 'Hello world ✔', // plaintext body
			    html: '<b>Hello world ✔</b>' // html body
			};
			var sentWithSuccess = false;
			Mailer.sendMail(email, smtpSettings)
			.then(function() {
				sentWithSuccess = true;
			}, function(err) {
				sentWithSuccess = false;
			})
			.then(function() {
				expect(sentWithSuccess).to.be.true;
				done();
			});
		});

		it('should throw error for emails with invalid parameters', function(done) {
			var email = {
			    from: 'skeleton <notifications@desaroxx.com>', // sender address
			    to: 'kenosteiner+nodemailer@gmail.com', // list of receivers
			    text: 'Hello world ✔', // plaintext body
			    html: '<b>Hello world ✔</b>' // html body
			};
			var sentWithSuccess = false;
			Mailer.sendMail(email, smtpSettings)
			.then(function() {
				sentWithSuccess = true;
			}, function(err) {
				sentWithSuccess = false;
			})
			.then(function() {
				expect(sentWithSuccess).to.be.false;
				done();
			});
		});
	});

});