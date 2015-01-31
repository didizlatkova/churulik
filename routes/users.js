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
	getUserById: function(id){

	},

	getUserByUserName = function(userName){

	},

	getNumberOfMessages: function(userName){

	},

	getFollowers: function(userName){

	},

	getNumberOfFollowers: function(userName){

	},

	getFollowing: function(userName){

	},

	getNumberOfFollowing: function(userName){

	},

	createUser: function(user){

	},

	updateUser: function(user){

	},
};