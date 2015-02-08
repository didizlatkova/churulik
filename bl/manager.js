module.exports = function(database) {
	var usersDb = database.collection('users'),
		messagesDb = database.collection('messages'),
		users = require('../db/users')(usersDb),
		messages = require('../db/messages')(messagesDb, usersDb),
		bcrypt = require('bcrypt-nodejs'),
		REQUIRED_ERROR = 'Полето е задължително',
		EXISTING_USER_ERROR = 'Такъв потребител вече съществува',
		INVALID_LOGIN_DATA = 'Грешен потребител или парола',
		SHORT_USERNAME = 'Името трябва да е поне 5 символа',
		SHORT_PASSWORD = 'Паролата трябва да е поне 5 символа';

	return {
		generateHash: function(password) {
			return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
		},

		validateLoginModel: function(model, callback) {
			var valid = true;
			if (!model.userNameLogin || model.userNameLogin === null) {
				model.userNameLoginError = REQUIRED_ERROR;
				valid = false;
			}
			if (!model.passwordLogin || model.passwordLogin === null) {
				model.passwordLoginError = REQUIRED_ERROR;
				valid = false;
			}

			if (!valid) {
				return callback(model, valid);
			}

			users.getUserByUserName(model.userNameLogin, function(user, err) {
				if (err) {
					model.generalError = INVALID_LOGIN_DATA;
					valid = false;
				} else if (!bcrypt.compareSync(model.passwordLogin, user.password)) {
					model.generalError = INVALID_LOGIN_DATA;
					valid = false;
				}

				callback(model, valid);
			});
		},

		validateRegisterModel: function(model, callback) {
			var valid = true;
			if (!model.names || model.names === null) {
				model.namesError = REQUIRED_ERROR;
				valid = false;
			}
			if (!model.userName || model.userName === null) {
				model.userNameError = REQUIRED_ERROR;
				valid = false;
			} else if (model.userName.length < 5) {
				model.userNameError = SHORT_USERNAME;
				valid = false;
			}

			if (!model.password || model.password === null) {
				model.passwordError = REQUIRED_ERROR;
				valid = false;
			} else if (model.password.length < 5) {
				model.passwordError = SHORT_PASSWORD;
				valid = false;
			}

			users.isUserAlreadyCreated(model.userName, function(created) {
				if (created) {
					model.userNameError = EXISTING_USER_ERROR;
					valid = false;
				}

				callback(model, valid);
			});
		},

		validateEditModel: function(model, callback) {
			var valid = true;
			if (!model.names || model.names === null) {
				model.namesError = REQUIRED_ERROR;
				valid = false;
			}

			callback(model, valid);
		},

		getUserFeedModel: function(user) {
			var model = user;
			model.loggedUser = user.userName;
			model.messagesCount = user.messages ? user.messages.length : 0;
			model.following = user.following ? user.following.length : 0;
			model.followers = user.followers ? user.followers.length : 0;
			model.popular = ["asd", "yolo", "mongodb"];
			model.description = undefined;
			return model;
		},

		getUserProfileModel: function(user, callback) {
			var model = user;
			model.messagesCount = user.messages ? user.messages.length : 0;
			model.following = user.following ? user.following.length : 0;
			model.followers = user.followers ? user.followers.length : 0;
			messages.getLatestN([user.userName], 20, function(messages, err) {
				if (!err) {
					model.messageContents = messages;
				}

				return callback(model);
			});
		},

		getUserEditModel: function(user) {
			var model = user;
			model.loggedUser = user.userName;
			model.description = user.description || '';
			return model;
		},

		getAuthorModel: function(user) {
			var model = {
				userName: user.userName,
				picture: user.picture
			};

			return model;
		}
	};
};