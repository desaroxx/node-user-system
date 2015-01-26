var Entry = require('./../model/Entry');

module.exports = function(app, passport) {

	app.route('/api/entries')
		.post(function(req, res) {
			console.log('handling POST /api/entries');
			var entry = new Entry();
			entry.user_id = req.body.user_id;
			entry.content = req.body.content;

			// save the entry
			entry.save(function(err) {
				if (err) {
					res.send(err);
				}
				res.json({ message: 'Entry created!'});
			});
		})
		.get(function(req, res) {
			console.log('handling GET /api/entries');

			var findFilters = {};
			if (typeof req.param('userId') != 'undefined') {
				console.log('setting filter: ' + req.param('userId'));
				findFilters.user_id = req.param('userId');
			} else {
				console.log('not setting filter: ' + req.param('userId'));
			}
			Entry.find(findFilters, function(err, entries) {
				if (err) {
					res.send(err);
				}
				var JSONEntries = {};
				JSONEntries.entries = entries;
				res.json(JSONEntries);
			});
		});

	app.route('/api/entries/:entry_id')
		.delete(function(req, res) {
			console.log('handling GET /api/entry/:entry_id');
			Entry.remove({
				_id: req.params.entry_id
			}, function(err, entry) {
				if (err) {
					res.send(err);
				}
				res.json({ message: 'Successfully deleted'});
			});
		});
};