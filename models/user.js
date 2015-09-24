var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    salt = bcrypt.genSaltSync(10),
    jwt = require('jsonwebtoken'),
    Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');
mongoose.Promise.ES6.promisify(jwt.verify);

var UserSchema = new Schema({

    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },

    roles: [String],

    password: {
        type: String,
        required: true
    },

    created: {
        type: Date,
        default: Date.now
    },

    updated: {
        type: Date,
        default: Date.now
    }

});

UserSchema.pre('save', function(next) {

    var cd = new Date();
    this.updated = cd;

    if (!this.created) {
        this.created = cd;
    }

    next();
});

UserSchema.methods.login = mongoose.Promise.ES6.method(function(username, password) {

    if (!password) {

        throw new Error('No password was provided');
    }

    return this.model('User').findOne({
            username: RegExp(username, 'i')
        })
        .exec()
        .then(function(user) {

            if (!user) {

                throw new Error('No user found');
            }

            if (bcrypt.compareSync(password, user.password)) {

                return user;
            }

            throw new Error('Password is invalid');

        })
        .catch(function(err) {

            throw new Error(err);
        });
});

UserSchema.methods.authenticate = mongoose.Promise.ES6.method(function(token) {

    if (!token) {

        throw new Error('No token supplied');
    }

    return jwt.verify(token, 'secret-key');


});

UserSchema.methods.getToken = mongoose.Promise.ES6.method(function() {

    if (this.isNew) {

        throw new Error('No user to tokenize');
    }

    var token = jwt.sign(this, 'secret-key', {
        expiresInMinutes: 1440 // expires in 24 hours
    });

    return token;
});

UserSchema.methods.register = function(username, password, roles) {

    this.username = username;
    this.password = bcrypt.hashSync(password, salt);
    !roles ? this.roles.push('USER') : this.roles = this.roles.concat(roles);
    return this.save();
};

UserSchema.methods.hasRole = mongoose.Promise.ES6.method(function(role) {

    if (this.roles.indexOf(role) >= 0) {
        return this;
    }
    throw new Error('User does not have permission');

});

UserSchema.methods.toJSON = function() {

    var obj = this.toObject();
    delete obj.password;
    return obj;
};


module.exports = mongoose.model('User', UserSchema);