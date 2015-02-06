'use strict';

var EntryController = require('./../controllers/EntryController');

module.exports = function(app, passport) {

	app.route('/api/entries')
		.post(function(req, res) {
			EntryController.createEntry(req, res);
		})
		.get(function(req, res) {
			EntryController.getEntries(req, res);
		});

	app.route('/api/entries/:entry_id')
		.delete(function(req, res) {
			EntryController.deleteEntry(req, res);
		});
};