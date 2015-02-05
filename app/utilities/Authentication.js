var jwt = require('jsonwebtoken');

var secret = require('./../../config/secret');

/*
 * Task: Extract user information from token
 * Return: user (if token invalid: null)
 */
module.exports.getUser = function(token) {
	var user = null;
	try {
		user = jwt.verify(token, secret.key);
	} catch (err) {

	}
	return user;
};