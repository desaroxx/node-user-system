'use strict';

var ArticleController = require('./../controllers/ArticleController');

module.exports = function(app, passport) {

	app.route('/api/articles')
		// create new article
		.post(passport.authenticate('jwt-bearer', { session: false }), function(req, res) {
			ArticleController.createArticle(req, res);
		})
		// get articles
		.get(function(req, res) {
			ArticleController.getArticles(req, res);
		});

	app.route('/api/articles/:article_id')
		// update article
		.put(passport.authenticate('jwt-bearer', { session: false }), function(req, res) {
			ArticleController.updateArticle(req, res);
		});
};