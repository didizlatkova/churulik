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

module.exports = function(messages, users) {
	return {
		getLatestNMessages: function(userNames, n) {

		},

		getNPopularHashTags: function(n) {

		},

		createMessage: function(message, author, callback) {
			message = to_database(message);
			message.author = author;
			messages.insert(message, function(err) {
				if (err) {
					console.error('Cannot insert message', err);
					return callback(null, err);
				}

				users.update({
					userName: author.userName
				}, {
					$push: {
						"messages": message._id
					}
				}, function(err) {
					if (err) {
						console.error('Cannot update user', err);
						return callback(null, err);
					}

					return callback(message);
				});
			});
		},

		deleteMessage: function(id) {

		},

		findMessageByHashtags: function(hashtags) {

		}
	};
};