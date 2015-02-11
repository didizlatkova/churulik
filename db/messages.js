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
	var getNByIds = function(ids, n, callback) {
		messages.find({
			_id: {
				$in: ids
			}
		}).limit(n).sort({
			datePublished: -1
		}).toArray(function(err, messages) {
			if (err) {
				console.error('Cannot get messages', err);
				return callback(null, err);
			}

			return callback(messages);
		});
	};

	return {
		getLatestN: function(userNames, n, callback) {
			if (userNames.length === 1) {
				users.findOne({
					userName: userNames[0]
				}, function(err, user) {
					if (err) {
						console.error('Cannot get user', err);
						return callback(null, err);
					}
					if (user !== null) {
						user.messages = user.messages || [];
						getNByIds(user.messages, n, function(messages, err) {
							if (err) {
								return callback(null, err);
							}

							return callback(messages);
						});
					} else {
						return callback(null);
					}
				});
			}
		},

		getNPopularHashTags: function(n) {

		},

		getNByIds: getNByIds,

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
					$addToSet: {
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

		deleteMessage: function(id, authorName, callback) {
			messages.remove({
				_id: new ObjectID(id)
			}, function(err) {
				if (err) {
					console.error('Cannot remove message', err);
					return false;
				}

				users.update({
					userName: authorName
				}, {
					$pull: {
						"messages": new ObjectID(id)
					}
				}, function(err) {
					if (err) {
						console.error('Cannot update user', err);
						return callback(false);
					}

					return callback(true);
				});
			});
		},

		findMessageByHashtags: function(hashtags) {

		}
	};
};