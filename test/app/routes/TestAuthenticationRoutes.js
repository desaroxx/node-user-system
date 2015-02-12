'use strict';
var mongoose        = require('mongoose');
var expect          = require('Chai').expect;
var request         = require('request');
var randomString    = require('randomstring');

var rootPath        = './../../../';
var AuthCtrl        = require(rootPath + 'app/controllers/AuthenticationController');
var Activator       = require(rootPath + 'app/services/Activator');
var secret          = require(rootPath + 'config/secret');

describe('Test AuthenticationRoutes', function () {

    // create a test user
    var randomStr = randomString.generate(7);
    var testUser = {
        username: randomStr,
        email: 'kenosteiner+' + randomStr + '+skeleton@gmail.com',
        password: 'Tenupu11'
    };

	var baseAPIUrl = 'http://localhost:8888/api';

    describe('GET /api/register', function() {

        var url = baseAPIUrl + '/register';

        it('should reject already existing email', function(done) {
            var querystring = {
                'email':'john@snow.com'
            };
            request.get({'url':url, 'qs':querystring}, function(err, response, body) {
                if (err) throw new Error('request failed');
                body = JSON.parse(body);
                expect(body.isFree).to.be.false;
                done();
            });

        });

        it('should reject already existing username', function(done) {
            var querystring = {
                'username':'JohnSnow'
            };
            request.get({'url':url, 'qs':querystring}, function(err, response, body) {
                if (err) throw new Error('request failed');
                body = JSON.parse(body);
                expect(body.isFree).to.be.false;
                done();
            });

        });

        it('should reject already existing username (match case-insensitive)', function(done) {
            var querystring = {
                'username':'JOHNSNOW'
            };
            request.get({'url':url, 'qs':querystring}, function(err, response, body) {
                if (err) throw new Error('request failed');
                body = JSON.parse(body);
                expect(body.isFree).to.be.false;
                done();
            });

        });

        it('should reject bad username format', function(done) {
            var querystring = {
                'username':'john.snow'
            };
            request.get({'url':url, 'qs':querystring}, function(err, response, body) {
                if (err) throw new Error('request failed');
                
                expect(response.statusCode).to.equal(400);
                done();
            });

        });

        it('should reject bad email format', function(done) {
            var querystring = {
                'email':'johnatsnow.com'
            };
            request.get({'url':url, 'qs':querystring}, function(err, response, body) {
                if (err) throw new Error('request failed');
                expect(response.statusCode).to.equal(400);
                done();
            });

        });

        it('should reject if no parameters', function(done) {
            request.get({'url':url}, function(err, response, body) {
                if (err) throw new Error('request failed');
                expect(response.statusCode).to.equal(400);
                done();
            });

        });

        it('should accept not existing email', function(done) {
            var querystring = {
                'email':'johnx@snow.com'
            };
            request.get({'url':url, 'qs':querystring}, function(err, response, body) {
                if (err) throw new Error('request failed');
                body = JSON.parse(body);
                expect(body.isFree).to.be.true;
                done();
            });
        });

        it('should accept not existing username', function(done) {
            var querystring = {
                'username':'johnxsnow'
            };
            request.get({'url':url, 'qs':querystring}, function(err, response, body) {
                if (err) throw new Error('request failed');
                body = JSON.parse(body);
                expect(body.isFree).to.be.true;
                done();
            });

        });

    });

    describe('POST /api/register', function() {
        var url = baseAPIUrl + '/register';

        it('should not register an already existing email', function(done) {
            // clone good user
            var user = JSON.parse(JSON.stringify(testUser));
            user.email = 'john@snow.com';

            request.post({'url':url, 'json':true, 'body':user}, function(err, response, body) {
                if (err) throw new Error('could not create new user');
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should not register an already existing, case-insensitive email', function(done) {
            // clone good user
            var user = JSON.parse(JSON.stringify(testUser));
            user.email = 'JOHN@snow.com';

            request.post({'url':url, 'json':true, 'body':user}, function(err, response, body) {
                if (err) throw new Error('could not create new user');
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should not register a already existing username', function(done) {
            // clone good user
            var user = JSON.parse(JSON.stringify(testUser));
            user.username = 'JohnSnow';

            request.post({'url':url, 'json':true, 'body':user}, function(err, response, body) {
                if (err) throw new Error('could not create new user');
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should not register a already existing, case-insensitive username', function(done) {
            // clone good user
            var user = JSON.parse(JSON.stringify(testUser));
            user.username = 'JOHNSNOW';

            request.post({'url':url, 'json':true, 'body':user}, function(err, response, body) {
                if (err) throw new Error('could not create new user');
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should not register when parameters are empty strings', function(done) {
            // clone good user
            var user = JSON.parse(JSON.stringify(testUser));
            user.email = '';

            request.post({'url':url, 'json':true, 'body':user}, function(err, response, body) {
                if (err) throw new Error('could not create new user');
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should not register when parameters are missing', function(done) {
            // clone good user
            var user = JSON.parse(JSON.stringify(testUser));
            delete user.email;

            request.post({'url':url, 'json':true, 'body':user}, function(err, response, body) {
                if (err) throw new Error('could not create new user');
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should register a user', function(done) {
            request.post({'url':url, 'json':true, 'body':testUser}, function(err, response, body) {
                if (err) throw new Error('could not create new user');
                if (response.statusCode != 200) throw new Error('bad statuscode: ' + response.statusCode);
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

    });

    describe('POST /api/activate', function() {
        var url = baseAPIUrl + '/activate';

        it('should not resend activation email if email missing', function(done) {
            request.post({'url':url, 'json':true, 'body': {}}, function(err, response, body) {
                expect(body.message.substring(0,15)).to.equal('There have been validation errors: '.substring(0,15));
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should not resend activation email if email invalid format', function(done) {
            request.post({'url':url, 'json':true, 'body': {'email':'tester.email'}}, function(err, response, body) {
                expect(body.message.substring(0,15)).to.equal('There have been validation errors: '.substring(0,15));
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should resend activation email if unactivated email input', function(done) {
            request.post({'url':url, 'json':true, 'body': {'email':testUser.email}}, function(err, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body.message.substring(0,15)).to.equal('activation resent to: '.substring(0,15));
                done();
            });
        });

        it('should not resend activation email if activated email input', function(done) {
            request.post({'url':url, 'json':true, 'body': {'email':'john@snow.com'}}, function(err, response, body) {
                if (err) throw new Error('could not create new user');
                expect(response.statusCode).to.equal(400);
                expect(body.message).to.equal('user already activated');
                done();
            });
        });

        it('should not resend activation email if email does not exist in db', function(done) {
            request.post({'url':url, 'json':true, 'body': {'email':'hokuspukus@emailadresse.com'}}, function(err, response, body) {
                expect(response.statusCode).to.equal(400);
                expect(body.message).to.equal('invalid email (1)');
                done();
            });
        });

    });

    describe('PUT /api/activate', function() {
        var url = baseAPIUrl + '/activate';

        it('should activate a user account with valid input', function(done) {
            var token = Activator.generateToken(testUser, secret.activationKey);
            request.put({'url':url, 'json':true, 'body':{'token':token}}, function(err, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('should fail to active with invalid token', function(done) {
            var token = Activator.generateToken(testUser, '43rwefsdasd');
            request.put({'url':url, 'json':true, 'body':{'token':token}}, function(err, response, body) {
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should fail to active with missing token', function(done) {
            request.put({'url':url, 'json':true, 'body':{}}, function(err, response, body) {
                expect(response.statusCode).to.equal(400);
                done();
            });
        });
    });

    describe('POST /api/auth', function () {
        var url = baseAPIUrl + '/auth';

        it('should grant a jsonwebtoken', function (done) {
        	var loginData = { email: 'john@snow.com', password: 'Tenupu11' };
        	request.post({'url':url, 'json':true, 'body':loginData}, function(err, response, body) {
                expect(body.token).to.have.length.above(10);
                done();
            });
        });

        it('should grant a jsonwebtoken (event if email is wrong case-sensitive)', function (done) {
            var loginData = { email: 'JOHN@SNOW.COM', password: 'Tenupu11' };
            request.post({'url':url, 'json':true, 'body':loginData}, function(err, response, body) {
                expect(body.token).to.have.length.above(10);
                done();
            });
        });

        it('should not grant token if email invalid', function(done) {
            var loginData = { email: 'johsn@snow.com', password: 'Tenupu11' };
            request.post({'url':url, 'json':true, 'body':loginData}, function(err, response, body) {
                expect(response.statusCode).to.equal(401);
                done();
            });
        });

        it('should not grant token if password invalid', function(done) {
            var loginData = { email: 'jOhn@snow.com', password: 'Tenupua11' };
            request.post({'url':url, 'json':true, 'body':loginData}, function(err, response, body) {
                expect(response.statusCode).to.equal(401);
                done();
            });
        });

        it('should not grant token if email missing', function(done) {
            var loginData = {password: 'Tenupu11' };
            request.post({'url':url, 'json':true, 'body':loginData}, function(err, response, body) {
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should not grant token if password missing', function(done) {
            var loginData = { email: 'jOhn@snow.com' };
            request.post({'url':url, 'json':true, 'body':loginData}, function(err, response, body) {
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should not grant token if email bad format', function(done) {
            var loginData = { email: 'johnsnow.com', password: 'Tenupu11' };
            request.post({'url':url, 'json':true, 'body':loginData}, function(err, response, body) {
                expect(response.statusCode).to.equal(400);
                done();
            });
        });
    });
});
