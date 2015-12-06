var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    salt = bcrypt.genSaltSync(10),
    jwt = require('jsonwebtoken'),
    Promise = require('bluebird'),
    Schema = mongoose.Schema;

mongoose.Promise = Promise;
//Promise.promisify(jwt.verify);

/**
 * @module User
 */
var UserSchema = new Schema({

    /** @prop {string} username - the username **/
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },

    /** @prop {string[]} roles - the users system roles **/
    roles: [String],


    /** @prop {string} password - the users password hash **/
    password: {
        type: String,
        required: true
    },

    /** @prop {boolean} enabled - the enabled user flag **/
    enabled: {
        type: Boolean,
        default: true
    },

    /** @prop {Date} created - the created date **/
    created: {
        type: Date,
        default: Date.now
    },

    /** @prop {Date} updated - the last update date **/
    updated: {
        type: Date,
        default: Date.now
    }

});

UserSchema.pre('save', function (next) {

    var cd = new Date();
    this.updated = cd;

    if (!this.created) {
        this.created = cd;
    }

    next();
});

/**
 * User login
 * @function login
 * @memberof module:User
 * @param {string} username - the username
 * @param {string} password - the password
 * @return {Promise<User>}
 */
UserSchema.statics.login = Promise.method(function (username, password) {

    if (!password) {

        throw new Error('No password was provided');
    }

    return this.findOne({
        username: RegExp(username, 'i')
    })

    .exec()

    .then(function (user) {

        if (!user) {

            throw new Error('No user found');
        }

        if (bcrypt.compareSync(password, user.password)) {

            return user;
        }

        throw new Error('Password is invalid');

    })

    .catch(function (err) {

        throw new Error(err);
    });
});

/**
 * Request web token
 * @function requestToken
 * @memberof module:User
 * @param {string} username - the username
 * @param {string} password - the password
 * @return {Promise<String>}
 */
UserSchema.statics.requestToken = Promise.method(function (username, password) {

    return this.login(username, password)
        .then(function (u) {
            return u.createToken();
        });

});

/**
 * Vaidate user against the JWT token
 * @function authenticate
 * @memberof module:User
 * @instance
 * @param {string} token - the JWT token
 * @return {Promise<User>} - the user
 */
UserSchema.methods.authenticate = Promise.method(function (token) {

    if (!token) {

        throw new Error('No token supplied');
    }

    var user = jwt.verify(token, 'secret-key');

    return this.model('User').findOne({
        '_id': user._id,
        'enabled': true
    })

    .exec()

    .then(function (user) {

        if (user) {

            return user;
        }

        throw new Error('Inactive user');
    });

});

/**
 * Create a JWT user token
 * @function createToken
 * @memberof module:User
 * @instance
 * @return {string} - the encoded user token
 */
UserSchema.methods.createToken = Promise.method(function () {

    if (this.isNew) {

        throw new Error('No user to tokenize');
    }

    var token = jwt.sign(this, 'secret-key', {
        expiresIn: 86400 // expires in 24 hours
    });

    return token;
});

/**
 * User register
 * @function register
 * @memberof module:User
 * @instance
 * @param {string[]} roles - an array of user roles
 * @return {Promise<User>}
 */
UserSchema.methods.register = function (roles) {

    this.password = bcrypt.hashSync(this.password, salt);

    if (!roles) {

        this.roles.push('USER');

    } else {

        this.roles = this.roles.concat(roles);
    }
    return this.save();
};

/**
 * Check if user has supplied role
 * @function hasRole
 * @memberof module:User
 * @instance
 * @param {string} role - a role to test for
 * @return {Promise<User>}
 */
UserSchema.methods.hasRole = Promise.method(function (role) {

    if (this.roles.indexOf(role) >= 0) {
        return this;
    }
    throw new Error('User does not have permission');

});

/**
 * Return user object as JSON string
 * @function toJSON
 * @memberof module:User
 * @instance
 * @return {string}
 */
UserSchema.methods.toJSON = function () {

    var obj = this.toObject();
    delete obj.password;
    return obj;
};


module.exports = mongoose.model('User', UserSchema);
