module.exports = function(database) {
	var usersDb = database.collection('users'),
		messagesDb = database.collection('messages'),
		users = require('../db/users')(usersDb),
		REQUIRED_ERROR = 'Полето е задължително',
		EXISTING_USER_ERROR = 'Такъв потребител вече съществува';

	return {
		getUser: function(userName, callback) {
			users.getUserByUserName(userName, function(user) {

			});
		},

		validateRegisterModel: function(model, callback) {
			var valid = true;
			if (!model.names || model.names === null) {
				model.namesError = REQUIRED_ERROR;
				valid = false;
			}
			if (!model.userName || model.userName === null) {
				model.userNameError = REQUIRED_ERROR;;
				valid = false;
			}
			if (!model.password || model.password === null) {
				model.passwordError = REQUIRED_ERROR;
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
	}
};