'use strict';

var Article = require('./../model/Article');

/*
 * Task: Create new article
 */
module.exports.createArticle = function(req, res) {
	var article = new Article();
	article.user_id = req.body.user_id;
	article.content = req.body.content;

	// save the article
	article.save(function(err) {
		if (err) {
			res.send(err);
		}
		res.json({ message: 'Article created!'});
	});
};

/*
 * Task: Get articles
 */
module.exports.getArticles = function(req, res) {
	var findFilters = {};
	if (typeof req.param('userId') != 'undefined') {
		console.log('setting filter: ' + req.param('userId'));
		findFilters.user_id = req.param('userId');
	} else {
		console.log('not setting filter: ' + req.param('userId'));
	}
	Article.find(findFilters, function(err, articles) {
		if (err) {
			res.send(err);
		}
		var JSONArticles = {};
		JSONArticles.articles = articles;
		res.json(JSONArticles);
	});
};

/*
 * Update article
 */
module.exports.updateArticle = function(req, res) {
	return res.json({ message: 'ok'});
};

/*
 * Task: Delete article
 */
module.exports.deleteArticle = function(req, res) {
	Article.remove({
		_id: req.params.article_id
	}, function(err, article) {
		if (err) {
			res.send(err);
		}
		res.json({ message: 'Successfully deleted'});
	});
};