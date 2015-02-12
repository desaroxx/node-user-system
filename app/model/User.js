'use strict';

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Q			 = require('q');

var UserSchema   = new Schema({
  email				: {type: String, lowercase: true}, 
  username 			: String,
  lowercaseUsername	: {type: String, lowercase: true}, 
  password			: String,
  activated			: {type: Boolean, default: false}
});

//  Schema.statics  //////////////////////////////////////////////////////////////////////////////////////////
UserSchema.statics.qFindByUsername = function(username) {
	var deferred = Q.defer();
	function callback(err, user) {
		if (err) deferred.reject(new Error('internal db error'));
		deferred.resolve(user);
	}
	var lowercaseUsername = username.toLowerCase(); 
	this.findOne({lowercaseUsername:lowercaseUsername}, callback);
	return deferred.promise;
};

UserSchema.statics.qFindByEmail = function(email) {
	var deferred = Q.defer();
	function callback(err, user) {
		if (err) deferred.reject(new Error('internal db error'));
		deferred.resolve(user);
	}
	this.findOne({email:email.toLowerCase()}, callback);
	return deferred.promise;
};

UserSchema.statics.qFindOne = function(query) {
	var deferred = Q.defer();
	sanitizeQuery(query);
	function callback(err, user) {
		if (err) {
			deferred.reject(new Error('internal db error'));
		} else {
			deferred.resolve(user);
		}
	}
	this.findOne(query, callback);
	return deferred.promise;
};

UserSchema.statics.qFind = function(query) {
	var deferred = Q.defer();
	sanitizeQuery(query);
	function callback(err, users) {
		if (err) deferred.reject(new Error('internal db error'));
		deferred.resolve(users);
	}
	this.find(query, callback);
	return deferred.promise;
};

UserSchema.statics.qFindByUsernameAndUpdate = function(username, update) {
	var deferred = Q.defer();
	function callback(err, user) {
		if (err) deferred.reject(new Error('internal db error'));
		deferred.resolve(user);
	}
	var lowercaseUsername = username.toLowerCase(); 
	var options = {};
	this.findOneAndUpdate({lowercaseUsername:lowercaseUsername}, update, options, callback);
	return deferred.promise;
};

//  Schema.methods  //////////////////////////////////////////////////////////////////////////////////////////
UserSchema.methods.qSave = function() {
	var deferred = Q.defer();
	function callback(err) {
		if(err) {
			deferred.reject(new Error('internal db error'));
		} else {
			deferred.resolve();
		}
	}
	this.save(callback);
	return deferred.promise;
};

//  module methods  ///////////////////////////////////////////////////////////////////////////////////

function sanitizeQuery(query) {
	// change single parameter query to lowercase
	if ('username' in query) {
		query.lowercaseUsername = query.username.toLowerCase();
		delete query.username;
	}
	if ('email' in query) {
		query.email = query.email.toLowerCase();
	}
	// change OR query to lowercase
	if ('$or' in query) {
		query.$or.forEach(function(item) {
			if ('email' in item) {
				item.email = item.email.toLowerCase();
			}
			if ('username' in item) {
				item.lowercaseUsername = item.username.toLowerCase();
				delete item.username;
			}
		});
	}
};


module.exports = mongoose.model('User', UserSchema);