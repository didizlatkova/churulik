var express = require('express'),
	moment = require('moment'),
	ObjectID = require('mongodb').ObjectID,
	router = express.Router();

function from_database(user) {
	user.id = user._id;
	delete user._id;

	return user;
}

function to_database(user) {
	user._id = new ObjectID(user.id);
	user.dateRegistered = moment(user.dateRegistered).toDate();

	delete user.id;

	return user;
}

module.exports = function(users) {
	return {
		getUserById: function(id) {
			users.findOne({
				_id: id
			}, function(err, user) {
				if (err) {
					console.error('Cannot get user', err);
					callback(null, err);
				}
				if (user !== null) {
					callback(from_database(user));
				} else {
					var e = new Error("Page not found.");
					e.status = 404;
					callback(null, e);
				}
			});
		},

		getUserByUserName: function(userName, callback) {
			users.findOne({
				userName: userName
			}, function(err, user) {
				if (err) {
					console.error('Cannot get user', err);
					callback(null, err);
				}
				if (user !== null) {
					callback(from_database(user));
				} else {
					var e = new Error("Page not found.");
					e.status = 404;
					callback(null, e);
				}
			});
		},

		// getNumberOfMessages: function(userName) {

		// },

		getFollowers: function(userName) {

		},

		getNumberOfFollowers: function(userName) {

		},

		getFollowing: function(userName) {

		},

		getNumberOfFollowing: function(userName) {

		},

		createUser: function(user) {

		},

		updateUser: function(user) {

		}
	};
};