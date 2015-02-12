var UserRoutes = require('./routes/UserRoutes');
var ArticleRoutes = require('./routes/ArticleRoutes');
var AuthenticationRoutes = require('./routes/AuthenticationRoutes');

module.exports = function(app, passport) {

	UserRoutes(app, passport);
	ArticleRoutes(app, passport);
	AuthenticationRoutes(app, passport);

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});
};