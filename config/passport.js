var JwtBearerStrategy = require('passport-http-jwt-bearer');

var User			= require('../app/model/User');
var secret          = require('./secret');

module.exports = function(passport) {
	
    passport.use(new JwtBearerStrategy(
        secret.key,
        function(tokenData, done) {
            User.findById(tokenData._id, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user, tokenData);
            });
       }
    ));
}