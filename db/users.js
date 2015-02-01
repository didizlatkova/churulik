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
					throw err;
				}				
				return from_database(user);
			});
		},

		getUserByUserName: function(userName, callback) {
			users.findOne({
				userName: userName
			}, function(err, user) {
				if (err) {
					console.error('Cannot get user', err);
					throw err;					
				}
				callback(from_database(user));
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