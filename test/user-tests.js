var mongoose = require('mongoose'),
    assert = require('assert'),
    User = require('../models/user'),
    bcrypt = require('bcrypt'),
    salt = bcrypt.genSaltSync(10),
    jwt = require('jsonwebtoken'),
    Promise = require('bluebird');

mongoose.connect('mongodb://localhost/rest-crm');


describe('User', function () {


    beforeEach(function (done) {

        this.timeout(2000);

        var password = bcrypt.hashSync('test1234', salt);

        var user = new User({
            username: 'someone@onthe.net',
            password: password,
            roles: ['USER']
        });
        user.save().then(function () {
            done();
        }).catch(done);
    });


    afterEach(function (done) {

        this.timeout(10000);

        mongoose.connection.db.dropDatabase(function (err) {
            done(err);
        });
    });

    describe('#register', function () {

        it('Should save a user with a default role', function (done) {

            var user = new User({
                username: 'test@test.net',
                password: 'test1234'
            });

            user.register()

            .then(function (user) {

                    assert.ok(user.id);
                    assert.equal(user.roles.length, 1);
                    assert.ok(bcrypt.compareSync('test1234', user.password));
                    assert.equal(user.roles[0], 'USER');
                    done();
                })
                .catch(function (err) {

                    console.log(err);
                    done(err);
                });
        });

        it('Should save a user with set roles', function (done) {

            var user = new User({
                username: 'test@test.net',
                password: 'test1234'
            });

            user.register(['ADMIN', 'USER'])

            .then(function (user) {

                assert.ok(user.id);
                assert.equal(user.roles.length, 2);
                assert.ok(bcrypt.compareSync('test1234', user.password));
                assert.equal(user.roles[0], 'ADMIN');
                assert.equal(user.roles[1], 'USER');
                done();
            })

            .catch(function () {

                console.log(err);
                done(err);
            });

        });

    });

    describe('#hasRole', function () {

        it('Should return true if user has supplied role', function () {

            var user = new User();

            user.roles.push('ADMIN');

            var count = 0;

            user.hasRole('USER')

            .then(function (u) {

                assert.ok(false);
            })

            .catch(function (err) {

                count++;
                assert.ok(true);

            });

            user.hasRole('ADMIN')

            .then(function (u) {

                count++;
                assert.ok(true);
            })

            .catch(function (err) {

                assert.ok(false);
            })

            .done(function () {

                assert.equal(count, 2);
            });

        });

    });

    describe('#login', function () {

        it('Should validate user using username and password', function (done) {

            User.login('someone@onthe.net', 'test1234')

            .then(function (u) {
                assert.equal(u.username, 'someone@onthe.net');
                assert.ok(bcrypt.compareSync('test1234', u.password));
                assert.equal(u.roles[0], 'USER');
                done();
            })

            .catch(done);
        });

        it('Should validate user using username and password but reject due to role', function (done) {

            User.login('someone@onthe.net', 'test1234')

            .then(function (u) {

                assert.equal(u.username, 'someone@onthe.net');
                return u.hasRole('ADMIN');
            })

            .then(function (u) {

                assert.ok(false);
            })

            .catch(function (err) {

                assert.ok(err);

            })

            .done(done);
        });

    });

    describe('#createToken', function () {

        it('Should throw an error if we attempt to get a token for an unsaved user', function (done) {

            var user = new User({
                username: 'another@test.com',
                passowrd: '123456',
                roles: ['USER']
            });

            user.createToken()

            .then(done)

            .catch(function (err) {

                assert.equal(err.message, 'No user to tokenize');

            })

            .done(done);
        });

        it('Should create a token for the user', function (done) {

            var usr = User.login('someone@onthe.net', 'test1234'),
                token = usr.then(function (u) {

                    return u.createToken();
                });

            Promise.join(usr, token, function (usr, token) {

                    var decoded = jwt.verify(token, 'secret-key');
                    assert.equal(decoded._id, usr._id);
                    assert.equal(decoded.username, usr.username);
                    done();
                })
                .catch(done);
        });
    });

    describe('#authenticate', function () {

        it('Should authenticate the a user with an enabled status', function (done) {

            var user = User.login('someone@onthe.net', 'test1234'),
                token = user.then(function (u) {

                    return u.createToken();
                });

            Promise.join(user, token, function (u, t) {

                    return u.authenticate(t);

                })

                .then(function(result) {

                    assert.equal(result.username, 'someone@onthe.net');
                    assert.deepEqual(result.roles.length, 1);
                    done();
                })

                .catch(done);
        });

        it('Should not authenticate a user with an enabled false status', function(done) {

            var user = User.login('someone@onthe.net', 'test1234')

            .then(function(user) {
                user.enabled = false;
                return user.save();
            });


            var token = user.then(function (u) {

                return u.createToken();
            });

            Promise.join(user, token, function(u, t) {

                return u.authenticate(t);
            })

            .then(function(result) {

                done(result);
            })

            .catch(function(err) {

                assert.equal(err.message, 'Inactive user');
                done();
            });

        });
    });

    describe('#requestToken', function() {

        it('Should create a toekn for a given valid username and password', function(done) {
            
            User.requestToken('someone@onthe.net', 'test1234')
                .then(function(token) {

                    var decoded = jwt.verify(token, 'secret-key');
                    assert.equal(decoded.username, 'someone@onthe.net');
                    done();
                })
                .catch(done);
        });
    });

});
