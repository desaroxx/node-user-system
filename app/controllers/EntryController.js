'use strict';

var Entry = require('./../model/Entry');

/*
 * Task: Create new entry
 */
module.exports.createEntry = function(req, res) {
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
};

/*
 * Task: Get entries
 */
module.exports.getEntries = function(req, res) {
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
};

/*
 * Task: Delete entry
 */
module.exports.deleteEntry = function(req, res) {
	Entry.remove({
		_id: req.params.entry_id
	}, function(err, entry) {
		if (err) {
			res.send(err);
		}
		res.json({ message: 'Successfully deleted'});
	});
};