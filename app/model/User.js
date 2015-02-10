'use strict';

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Q			 = require('q');

var UserSchema   = new Schema({
  email: 		String,
  username: 	String,
  password: 	String,
  activated: 	{ type: Boolean, default: false }
});

UserSchema.statics.qFindByUsername = function(username) {
	var deferred = Q.defer();
	function callback(err, user) {
		if (err) deferred.reject(new Error(err));
		deferred.resolve(user);
	}
	this.findOne({username:username}, callback);
	return deferred.promise;
};

UserSchema.statics.qFindOne = function(query) {
	var deferred = Q.defer();
	function callback(err, user) {
		if (err) deferred.reject(new Error(err));
		deferred.resolve(user);
	}
	this.findOne(query, callback);
	return deferred.promise;
}

UserSchema.statics.qFind = function(query) {
	var deferred = Q.defer();
	function callback(err, users) {
		if (err) deferred.reject(new Error(err));
		deferred.resolve(users);
	}
	this.find(query, callback);
	return deferred.promise;
}

module.exports = mongoose.model('User', UserSchema);