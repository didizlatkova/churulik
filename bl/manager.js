module.exports = function(database) {
	var usersDb = database.collection('users'),
		messagesDb = database.collection('messages'),
		users = require('../db/users')(usersDb),
		bcrypt = require('bcrypt-nodejs'),
		REQUIRED_ERROR = 'Полето е задължително',
		EXISTING_USER_ERROR = 'Такъв потребител вече съществува',
		INVALID_LOGIN_DATA = 'Грешен потребител или парола';

	return {
		getUser: function(userName, callback) {
			users.getUserByUserName(userName, function(user) {

			});
		},

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
		}
	};
};