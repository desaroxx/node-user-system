'use strict';

var jwt = require('jsonwebtoken');
/*
 * Task: Generate identification token for activation email
 *
 * Parameter:
 * o Object 'user':
 *   - string 'username'
 *   - string 'email'
 * o string 'secret'
 * Return: string (token)
 */
module.exports.generateToken = function(user, secret) {
	var payload = {};
	payload.username = user.username;
	payload.email = user.email;
	return jwt.sign(payload, secret);
};

/*
 * Task: Verify if token is valid, extract user data from token
 *
 * Parameter:
 * o string 'token'
 * o string 'secret'
 * Return:
 * o Object 'user':
 *   - string 'username'
 *   - string 'email'
 */
module.exports.verfiyAndGetUser = function(token, secret) {
	var user;
	try {
		user = jwt.verify(token, secret);
	} catch(err) {
		return null;
	}
	return user;
};
