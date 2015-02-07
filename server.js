// modules =================================================
var express 			= require('express');
var app 				= express();
var mongoose 			= require('mongoose');
var passport			= require('passport');
var bodyParser 			= require('body-parser');
var expressValidator	= require('express-validator');
var customValidators	= require('./app/utilities/CustomValidators');
var https 				= require('https');
var http 				= require('http');
var fs 					= require('fs');
var methodOverride 		= require('method-override');
var morgan				= require('morgan');

// configuration ===========================================

// database
var db = require('./config/db');
mongoose.connect(db.url);

// authentication
require('./config/passport')(passport); // pass passport for configuration

// port
var port = process.env.PORT || 8888;

// express setup
app.use(morgan('dev')); // log every request to the console

app.use(bodyParser.json()); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(expressValidator(customValidators));

app.use(passport.initialize());

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app, passport); // pass our application into our routes


// start secured app =======================================
// var hskey 		= fs.readFileSync('./config/key/hacksparrow-key.pem');
// var hscert 		= fs.readFileSync('./config/key/hacksparrow-cert.pem')

// var options = {
//     key: hskey,
//     cert: hscert
// };

// var httpsServer = https.createServer(options, app);
// httpsServer.listen(port, function() {
// 	console.log('[server.js] listening on port: ' + port);
// });

var httpServer = http.createServer(app);
httpServer.listen(port, function() {
	console.log('[server.js] listening on port: ' + port);
});