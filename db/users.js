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
	user.picture = '../img/avatar.png';
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
					err = new Error(PAGE_NOT_FOUND_ERROR);
					err.status = 404;
					callback(null, err);
				}
			});
		},

		getAll: function(callback) {
			users.find({}).sort({
				names: 1,
				userName: 1
			}).toArray(function(err, users) {
				if (err) {
					console.error('Cannot get user', err);
					callback(null, err);
				}

				callback(users);
			});
		},

		getFollowers: function(userName, callback) {
			users.find({
				following: userName
			}).sort({
				names: 1,
				userName: 1
			}).toArray(function(err, users) {
				if (err) {
					console.error('Cannot get users', err);
					callback(null, err);
				}

				callback(users);
			});
		},

		getFollowing: function(userName, callback) {
			users.find({
				followers: userName
			}).sort({
				names: 1,
				userName: 1
			}).toArray(function(err, users) {
				if (err) {
					console.error('Cannot get users', err);
					callback(null, err);
				}

				callback(users);
			});
		},

		createUser: function(user, callback) {
			user = to_database(user);

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

		updateUser: function(user, callback) {
			users.update({
				userName: user.userName
			}, {
				$set: user
			}, function(err) {
				if (err) {
					console.error('Cannot update user', err);
					return callback(null, err);
				}

				return callback(user);
			});
		},

		followUser: function(userName, followedUser, callback) {
			users.update({
				userName: userName
			}, {
				$addToSet: {
					"following": followedUser
				}
			}, function(err) {
				if (err) {
					console.error('Cannot update user', err);
					return callback(false, err);
				}

				users.update({
					userName: followedUser
				}, {
					$addToSet: {
						"followers": userName
					}
				}, function(err) {
					if (err) {
						console.error('Cannot update user', err);
						return callback(false, err);
					}
					return callback(true);
				});
			});
		},

		unfollowUser: function(userName, followedUser, callback) {
			users.update({
				userName: userName
			}, {
				$pull: {
					"following": followedUser
				}
			}, function(err) {
				if (err) {
					console.error('Cannot update user', err);
					return callback(false, err);
				}

				users.update({
					userName: followedUser
				}, {
					$pull: {
						"followers": userName
					}
				}, function(err) {
					if (err) {
						console.error('Cannot update user', err);
						return callback(false, err);
					}
					return callback(true);
				});
			});
		}
	};
};