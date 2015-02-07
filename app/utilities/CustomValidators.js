'use strict';

module.exports = {
	customValidators: {
	    /*
		 * Task: Validate email address
		 */
	    isEmail: function(email) { 
		    var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		    return regex.test(email);
		},

		/*
		 * Task: Validate username
		 * Username criteria:
		 * o allowed characters: a-z,A-Z,0-9,-,_
		 * o number of characters: 3-30
		 */
		isUsername: function(username) {
			var regex = /^[a-zA-Z0-9\-_]{3,30}$/;
			return regex.test(username);
		},

		/*
		 * Task: Vaidate password
		 * Password criteria:
		 * o at least one: number, lowercase and uppercase letter
		 * o number of characters: 6-30
		 */
		isPassword: function(password) {
			var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,30}$/;
		    return regex.test(password);
		}
	}   
};