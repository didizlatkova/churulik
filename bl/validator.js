var REQUIRED_ERROR = 'Полето е задължително',
    EXISTING_USER_ERROR = 'Такъв потребител вече съществува',
    EXISTING_EMAIL_ERROR = 'Потребител с такава електронна поща вече съществува',
    INVALID_LOGIN_DATA = 'Грешен потребител или парола',
    SHORT_USERNAME = 'Името трябва да е поне 5 символа',
    SHORT_PASSWORD = 'Паролата трябва да е поне 5 символа',
    INVALID_EMAIL = 'Невалидна електронна поща',
    EMAIL_PATTERN = /^([\w\-]+(?:\.[\w\-]+)*)@((?:[\w\-]+\.)*\w[\w\-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
    bcrypt = require('bcrypt-nodejs');

module.exports = function(database) {
    var usersDb = database.collection('users'),
        users = require('../db/users')(usersDb);

    return {
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
                if (err || !bcrypt.compareSync(model.passwordLogin, user.password)) {
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

            if (!model.email || model.email === null) {
                model.emailError = REQUIRED_ERROR;
                valid = false;
            } else if (!EMAIL_PATTERN.test(model.email)) {
                model.emailError = INVALID_EMAIL;
                valid = false;
            }

            if (!model.password || model.password === null) {
                model.passwordError = REQUIRED_ERROR;
                valid = false;
            } else if (model.password.length < 5) {
                model.passwordError = SHORT_PASSWORD;
                valid = false;
            }

            users.existsUserName(model.userName, function(created) {
                if (created) {
                    model.userNameError = EXISTING_USER_ERROR;
                    valid = false;
                }

                users.existsEmail(model.email, function(created) {
                    if (created) {
                        model.emailError = EXISTING_EMAIL_ERROR;
                        valid = false;
                    }

                    callback(model, valid);
                });
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

        generateHash: function(password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        }
    };
};
