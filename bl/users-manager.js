var MESSAGES_TO_DISPLAY = 50,
	messagesManager = require('../bl/messages-manager')(),
	path = require('path'),
	fs = require("fs");

module.exports = function(database) {
	var messagesDb = database.collection('messages'),
		usersDb = database.collection('users'),
		messages = require('../db/messages')(messagesDb, usersDb);

	return {
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
					model.messageContents = messagesManager.getMessagesModel(messages);
				}

				return callback(model);
			});
		},

		getUserFeedModel: function(user, callback) {
			var model = user;
			model.loggedUser = user.userName;
			model.messagesCount = user.messages ? user.messages.length : 0;
			model.followingCount = user.following ? user.following.length : 0;
			model.followersCount = user.followers ? user.followers.length : 0;
			messages.getNPopularHashtags(5, function(hashtags) {
				model.popular = hashtags.map(function(x) {
					return messagesManager.getMessageWithHashtags('#' + x._id);
				});

				model.description = undefined;
				user.following = user.following || [];
				messages.getLatestNByUsers(user.following.concat([user.userName]), MESSAGES_TO_DISPLAY, function(messages, err) {
					if (!err) {
						model.messageContents = messagesManager.getMessagesModel(messages);
					}

					return callback(model);
				});
			});
		},

		getUserEditModel: function(user) {
			var model = user;
			model.description = user.description || '';
			return model;
		},

		getEditPostModel: function(user, userName, callback) {
			var model = {
				userName: userName,
				names: user.names,
				description: user.description
			};

			if (user.src && user.src !== '') {
				var dir = path.join(__dirname, '../public/avatars/');				
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                
				var imgPath = '../public/avatars/' + userName + '.' + 'png';
				var diskPath = path.join(__dirname, imgPath);
				var base64Data = user.src.replace(/^data:image\/png;base64,/, "");

				fs.writeFile(diskPath, base64Data, 'base64', function(err) {
					if (!err) {
						model.picture = imgPath;
					} else {
						console.error('Cannot save image', err);
					}
					callback(model);
				});
			} else {
				callback(model);
			}
 		},

		getAuthorModel: function(user) {
			var model = {
				userName: user.userName,
				picture: user.picture
			};

			return model;
		},

		getUsersModel: function(allUsers, loggedUser, title) {			
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

			return {
				loggedUser: loggedUser,
				title: title,
				users: resultUsers
			};
		}		
	};
};