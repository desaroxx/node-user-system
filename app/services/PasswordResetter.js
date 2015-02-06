'use strict';

var jwt = require('jsonwebtoken');
/*
 * Task: Generate identification token for password recovery email
 *
 * Parameter:
 * o string 'email'
 * o string 'secret'
 * Return: string (token)
 * Specifics:
 * o Token valid for 30 min
 */
module.exports.generateToken = function(email, secret) {
	var payload = {email: email};
	var options = {expiresInMinutes: 30};
	return jwt.sign(payload, secret, options);
};

/*
 * Task: Verify if token is valid, extract email address from token
 *
 * Parameter:
 * o string 'token'
 * o string 'secret'
 * Return:
 * o string 'email'
 */
module.exports.verfiyAndGetEmail = function(token, secret) {
	var email;
	try {
		email = jwt.verify(token, secret).email;
	} catch(err) {
		return null;
	}
	return email;
};