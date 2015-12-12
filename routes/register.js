var express = require('express'),
    router = express.Router(),
    User = require('../models/user');

router.post('/', function (req, res, next) {

    var data = req.body,
        user;

    if (!data || !data.username || !data.password) {

        res.json({
            success: false,
            message: 'balls'
        });
        return;
    }

    user = new User({
        username: data.username,
        password: data.password
    });

    user.register()

    .then(function (user) {

        console.log('Created new user with id ' + user.id);
        res.json({
            success: true,
            message: 'You have been registered'
        });
    })

    .catch(function (err) {
        console.log('derp');
        res.json({
            success: false,
            message: err.message
        });
    });

});

module.exports = router;
