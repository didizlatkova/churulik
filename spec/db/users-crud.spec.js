describe("users crud", function() {
    var mongoFunction = require('../mongo.js'),
        database,
        users;

    beforeEach(function(done) {
        mongoFunction(function(db) {
            database = db;
            done();
        });
    });

    it("db should exist", function() {
        expect(database).toBeDefined();
    });

    it("users collection should exist", function() {
        var usersDb = database.collection('users');
        users = require('../../db/users')(usersDb);

        expect(usersDb).toBeDefined();
        expect(users).toBeDefined();
    });

    it("create", function(done) {
        var userToCreate = {
            userName: 'diditests',
            names: 'Didi Tests',
            password: 'nothashed'
        };

        users.create(userToCreate, function(user) {
            expect(user).toBeDefined();
            expect(user.userName).toEqual(userToCreate.userName);
            expect(user.names).toEqual(userToCreate.names);
            expect(user.password).toEqual(userToCreate.password);
            done();
        });
    });

    it("user exists", function(done) {
        var userName = 'diditests';
        users.exists(userName, function(success) {
            expect(success).toBeTruthy();
            done();
        });
    });

    it("get by username", function(done) {
        var userName = 'diditests';
        users.getByUserName(userName, function(user, err) {
            expect(err).toBeUndefined();
            expect(user).toBeDefined();
            expect(user.userName).toEqual(userName);
            done();
        });
    });

    it("get by username (non-existant)", function(done) {
        users.getByUserName('non-existant', function(user, err) {
            expect(err).toBeDefined();
            expect(user).toBeNull();
            done();
        });
    });

    it("update", function(done) {
        var userToUpdate = {
            userName: 'diditests',
            names: 'Didi Tests Updated',
            password: 'nothashed'
        };

        users.update(userToUpdate, function(user, err) {
            expect(err).toBeUndefined();
            expect(user).toBeDefined();
            expect(user.names).toEqual(userToUpdate.names);
            done();
        });
    });

    it("delete", function(done) {
        users.delete('diditests', function(success) {
            expect(success).toBeTruthy();
            done();
        });
    });

    it("user exists after deletion", function(done) {
        var userName = 'diditests';
        users.exists(userName, function(success) {
            expect(success).toBeFalsy();
            done();
        });
    });
});
