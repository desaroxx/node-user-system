'use strict';

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
  email: 		String,
  username: 	String,
  password: 	String,
  activated: 	{ type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
