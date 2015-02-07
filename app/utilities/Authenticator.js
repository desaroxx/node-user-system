'use strict';

var jwt = require('jsonwebtoken');

/*
 * Task: Extract user information from token
 * Parameter:
 * o string 'token'
 * o string 'secret'
 * Return: user (if token invalid: null)
 */
module.exports.getUser = function(token, secret) {
	var user = null;
	try {
		user = jwt.verify(token, secret);
	} catch (err) {
	}
	return user;
};