describe("validator", function() {
    var mongoFunction = require('../mongo.js'),
        validator,
        database,
        users,
        userToCreate,
        requiredText = 'задължително',
        wrongText = 'Грешен',
        shortText = 'поне',
        existingText = 'съществува';

    beforeEach(function(done) {
        mongoFunction(function(db) {
            database = db;
            var usersDb = database.collection('users');
            users = require('../../db/users')(usersDb);
            validator = require('../../bl/validator')(database);
            done();
        });
    });

    it("login model - no username", function(done) {
        var model = {
            passwordLogin: "1234567"
        };
        validator.validateLoginModel(model, function(user, valid) {
            expect(user).toBeDefined();
            expect(valid).toBeFalsy();
            expect(user.generalError).toBeUndefined();
            expect(user.userNameLoginError).toBeDefined();
            expect(user.userNameLoginError.indexOf(requiredText) !== -1).toBeTruthy();
            expect(user.passwordLoginError).toBeUndefined();
            done();
        });
    });

    it("login model - no password", function(done) {
        var model = {
            userNameLogin: "didi93"
        };
        validator.validateLoginModel(model, function(user, valid) {
            expect(user).toBeDefined();
            expect(valid).toBeFalsy();
            expect(user.generalError).toBeUndefined();
            expect(user.userNameLoginError).toBeUndefined();
            expect(user.passwordLoginError).toBeDefined();
            expect(user.passwordLoginError.indexOf(requiredText) !== -1).toBeTruthy();
            done();
        });
    });

    it("login model - non-existing user", function(done) {
        var model = {
            userNameLogin: "didi93",
            passwordLogin: "1234567"
        };
        validator.validateLoginModel(model, function(user, valid) {
            expect(user).toBeDefined();
            expect(valid).toBeFalsy();
            expect(user.generalError).toBeDefined();
            expect(user.generalError.indexOf(wrongText) !== -1).toBeTruthy();
            expect(user.userNameLoginError).toBeUndefined();
            expect(user.passwordLoginError).toBeUndefined();
            done();
        });
    });

    it("generate hash", function() {
        var password = "plaintext";
        var hash = validator.generateHash(password);
        expect(hash).toBeDefined();
        expect(hash).toNotEqual(password);
        expect(hash.indexOf(password) === -1);
        expect(hash.length).toBe(60);
    });

    it("login model - wrong password", function(done) {
        userToCreate = {
            userName: 'didi93',
            names: 'Didi Tests',
            password: validator.generateHash('1234567')
        };
        users.create(userToCreate, function() {
            var model = {
                userNameLogin: userToCreate.userName,
                passwordLogin: "123456"
            };
            validator.validateLoginModel(model, function(user, valid) {
                expect(user).toBeDefined();
                expect(valid).toBeFalsy();
                expect(user.generalError).toBeDefined();
                expect(user.generalError.indexOf(wrongText) !== -1).toBeTruthy();
                expect(user.userNameLoginError).toBeUndefined();
                expect(user.passwordLoginError).toBeUndefined();
                done();
            });
        });
    });

    it("login model - valid", function(done) {
        var model = {
            userNameLogin: userToCreate.userName,
            passwordLogin: '1234567'
        };
        validator.validateLoginModel(model, function(user, valid) {
            expect(user).toBeDefined();
            expect(valid).toBeTruthy();
            expect(user.generalError).toBeUndefined();
            expect(user.userNameLoginError).toBeUndefined();
            expect(user.passwordLoginError).toBeUndefined();
            done();
        });
    });

    it("register model - no data", function(done) {
        validator.validateRegisterModel({}, function(user, valid) {
            expect(user).toBeDefined();
            expect(valid).toBeFalsy();
            expect(user.namesError).toBeDefined();
            expect(user.namesError.indexOf(requiredText) !== -1).toBeTruthy();
            expect(user.userNameError).toBeDefined();
            expect(user.userNameError.indexOf(requiredText) !== -1).toBeTruthy();
            expect(user.passwordError).toBeDefined();
            expect(user.passwordError.indexOf(requiredText) !== -1).toBeTruthy();
            done();
        });
    });

    it("register model - short data", function(done) {
        var model = {
            names: 'Tester Testerov',
            userName: 'asdf',
            password: '1234'
        };

        validator.validateRegisterModel(model, function(user, valid) {
            expect(user).toBeDefined();
            expect(valid).toBeFalsy();
            expect(user.userNameError).toBeDefined();
            expect(user.userNameError.indexOf(shortText) !== -1).toBeTruthy();
            expect(user.passwordError).toBeDefined();
            expect(user.passwordError.indexOf(shortText) !== -1).toBeTruthy();
            done();
        });
    });

    it("register model - existing user", function(done) {
        var model = {
            names: 'Tester Testerov',
            userName: userToCreate.userName,
            password: '12345'
        };

        validator.validateRegisterModel(model, function(user, valid) {
            expect(user).toBeDefined();
            expect(valid).toBeFalsy();
            expect(user.userNameError).toBeDefined();
            expect(user.userNameError.indexOf(existingText) !== -1).toBeTruthy();
            done();
        });
    });

    it("register model - valid user", function(done) {
        var model = {
            names: 'Tester Testerov',
            userName: 'nonexisting',
            password: '12345'
        };

        validator.validateRegisterModel(model, function(user, valid) {
            expect(user).toBeDefined();
            expect(valid).toBeTruthy();
            expect(user.userNameError).toBeUndefined();
            expect(user.namesError).toBeUndefined();
            expect(user.passwordError).toBeUndefined();
            
            users.delete(userToCreate.userName, function() {
                users.delete('nonexisting', function() {
                    done();
                });
            });
        });
    });
});
