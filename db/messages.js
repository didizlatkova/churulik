var express = require('express'),
    moment = require('moment'),
    ObjectID = require('mongodb').ObjectID;    

function from_database(message) {
	message.id = message._id;
	delete message._id;

	return message;
}

function to_database(message) {
	message._id = new ObjectID(message.id);
	message.datePublished = moment(message.datePublished).toDate();

	delete message.id;

	return message;
}

module.exports = function(messages) {
	getLatestNMessages: function(userNames, n){

	},

	getNPopularHashTags: function(n){

	},

	deleteMessage: function(id){

	},

	findMessageByHashtags: function(hashtags){

	},
};