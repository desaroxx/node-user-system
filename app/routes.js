var UserRoutes = require('./routes/UserRoutes');
var EntryRoutes = require('./routes/EntryRoutes');

module.exports = function(app, passport) {

	UserRoutes(app, passport);
	
	EntryRoutes(app, passport);

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});
};