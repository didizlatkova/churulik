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
	var getLatestN = function(ids, n, callback) {
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
		getLatestNByUsers: function(userNames, n, callback) {
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
						getLatestN(user.messages, n, function(messages, err) {
							if (err) {
								return callback(null, err);
							}

							return callback(messages);
						});
					} else {
						return callback(null);
					}
				});
			} else {
				messages.find({
					"author.userName": {
						$in: userNames
					}
				}).limit(n).sort({
					datePublished: -1
				}).toArray(function(err, messages) {
					if (err) {
						console.error('Cannot get messages', err);
						callback(null, err);
					}

					callback(messages);
				});
			}
		},

		getNPopularHashtags: function(n, callback) {
			messages.aggregate([{
				$unwind: '$hashtags'
			}, {
				$group: {
					_id: '$hashtags',
					numberOfMentions: {
						$sum: 1
					}
				}
			}, {
				$sort: {
					numberOfMentions: -1
				}
			}, {
				$limit: n
			}], function(err, hashtags) {
				if (err) {
					callback([]);
				}

				callback(hashtags || []);
			});
		},

		create: function(message, author, callback) {
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

		delete: function(id, authorName, callback) {
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

		findByHashtags: function(hashtags, callback) {
			messages.find({
				hashtags: {
					$all: hashtags
				}
			}).sort({
				datePublished: -1
			}).toArray(function(err, messages) {
				if (err) {
					console.error('Cannot get messages', err);
					callback(null, err);
				}

				callback(messages);
			});
		}
	};
};