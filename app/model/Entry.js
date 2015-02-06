'use strict';

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EntrySchema   = new Schema({
  user_id: 		String,
  content: 		String
});

module.exports = mongoose.model('Entry', EntrySchema);