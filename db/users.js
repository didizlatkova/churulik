var express = require('express'),
	moment = require('moment'),
	ObjectID = require('mongodb').ObjectID,
	router = express.Router(),
	PAGE_NOT_FOUND_ERROR = 'Страницата не е намерена';

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
		getUserById: function(id, callback) {
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
					var e = new Error(PAGE_NOT_FOUND_ERROR);
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
					var err = new Error(PAGE_NOT_FOUND_ERROR);
					err.status = 404;
					callback(null, err);
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

		createUser: function(user, callback) {
			var user = to_database(user);

			users.insert(user, function(err) {
				if (err) {
					console.error('Cannot insert user', err);
					return callback(null, err);
				}
				return callback(user);
			});
		},

		isUserAlreadyCreated: function(userName, callback) {
			this.getUserByUserName(userName, function(user, err) {
				callback(user && user !== null);
			});
		},

		updateUser: function(user) {

		}
	};
};