module.exports = function(database) {
	var usersDb = database.collection('users'),
		messagesDb = database.collection('messages'),
		users = require('../db/users')(usersDb),
		messages = require('../db/messages')(messagesDb, usersDb),
		bcrypt = require('bcrypt-nodejs'),
		moment = require('moment'),
		escape = require('escape-html'),
		REQUIRED_ERROR = 'Полето е задължително',
		EXISTING_USER_ERROR = 'Такъв потребител вече съществува',
		INVALID_LOGIN_DATA = 'Грешен потребител или парола',
		SHORT_USERNAME = 'Името трябва да е поне 5 символа',
		SHORT_PASSWORD = 'Паролата трябва да е поне 5 символа',
		PATTERN = /(^|\s)#([a-zA-Z\u0400-\u04FF\d\-_]+)/ig,
		MESSAGES_TO_DISPLAY = 50,

		getTimeInterval = function(datePublished) {
			var interval = moment().diff(moment(datePublished), 'years');
			var period = interval === 1 ? 'година' : 'години';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'months');
			period = interval === 1 ? 'месец' : 'месеца';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'weeks');
			period = interval === 1 ? 'седмица' : 'седмици';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'days');
			period = interval === 1 ? 'ден' : 'дни';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'hours');
			period = interval === 1 ? 'час' : 'часа';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'minutes');
			period = interval === 1 ? 'минута' : 'минути';
			if (interval > 0) {
				return 'преди ' + interval + ' ' + period;
			}

			interval = moment().diff(moment(datePublished), 'seconds');
			period = interval === 1 ? 'секунда' : 'секунди';
			return 'преди ' + interval + ' ' + period;
		},

		getMessageWithHashtags = function(content) {
			var anchor = '$1<a href="/search?query=$2">#$2</a>';
			return content.replace(PATTERN, anchor);
		},

		getMessagesModel = function(messages) {
			messages.forEach(function(message) {
				message.content = getMessageWithHashtags(escape(message.content));
				message.time = getTimeInterval(message.datePublished);
			});

			return messages;
		},

		unique = function(value, index, self) {
			return self.indexOf(value) === index;
		};

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

			users.getByUserName(model.userNameLogin, function(user, err) {
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

		getUserFeedModel: function(user, callback) {
			var model = user;
			model.loggedUser = user.userName;
			model.messagesCount = user.messages ? user.messages.length : 0;
			model.followingCount = user.following ? user.following.length : 0;
			model.followersCount = user.followers ? user.followers.length : 0;
			messages.getNPopularHashtags(5, function(hashtags) {
				model.popular = hashtags.map(function(x) {
					return getMessageWithHashtags('#' + x._id);
				});

				model.description = undefined;
				user.following = user.following || [];
				messages.getLatestNByUsers(user.following.concat([user.userName]), MESSAGES_TO_DISPLAY, function(messages, err) {
					if (!err) {
						model.messageContents = getMessagesModel(messages);
					}

					return callback(model);
				});
			});
		},

		getUserProfileModel: function(user, loggedUser, callback) {
			var model = user;
			model.followers = model.followers || [];
			model.messagesCount = user.messages ? user.messages.length : 0;
			model.followingCount = user.following ? user.following.length : 0;
			model.followersCount = user.followers ? user.followers.length : 0;
			model.loggedUser = loggedUser;
			model.isFollowedByLoggedUser = user.followers.indexOf(loggedUser) > -1;
			messages.getLatestNByUsers([user.userName], MESSAGES_TO_DISPLAY, function(messages, err) {
				if (!err) {
					model.messageContents = getMessagesModel(messages);
				}

				return callback(model);
			});
		},

		getUserEditModel: function(user) {
			var model = user;
			model.description = user.description || '';
			return model;
		},

		getAuthorModel: function(user) {
			var model = {
				userName: user.userName,
				picture: user.picture
			};

			return model;
		},

		getUsersModel: function(allUsers, loggedUser) {
			var resultUsers = [];
			allUsers.forEach(function(user) {
				user.followers = user.followers || [];
				resultUsers.push({
					names: user.names,
					userName: user.userName,
					picture: user.picture,
					verified: user.verified,
					loggedUser: loggedUser,
					isFollowedByLoggedUser: user.followers.indexOf(loggedUser) > -1,
					messagesCount: user.messages ? user.messages.length : 0,
					followingCount: user.following ? user.following.length : 0,
					followersCount: user.followers ? user.followers.length : 0
				});
			});

			return resultUsers;
		},

		getMessagesModel: getMessagesModel,

		getMessageHashtags: function(message) {
			var hashtags = message.match(PATTERN) || [];
			hashtags = hashtags.map(function(x) {
				return x.split('#')[1];
			});

			return hashtags.filter(unique);
		}
	};
};