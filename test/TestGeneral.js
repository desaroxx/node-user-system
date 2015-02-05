var expect = require('chai').expect();

describe('TestGeneral', function() {
	it('should test something', function() {
		var req = {};
		req.body = {};
		var email = req.body.email;
		var username = req.body.username;
		var password = req.body.password;

		console.log(email);
	});
});