var express = require('express'),
    router = express.Router(),
    User = require('../models/user');

router.post('/', function(req, res, next) {

  

    var user = new User(),
    	data = req.body;

    if (!data || !data.username || !data.password) {

        res.json({
            success: false,
            message: 'balls'
        });
        return;
    }

    user.login(data.username, data.password)

    .then(function(user) {

        console.log('Found user ' + user.id + ' : ' + user.username);
        return user.getToken();
    })

    .then(function(token) {

        res.json({
            success: true,
            token: token
        })
    })

    .catch(function(err) {

        console.log(err);
        res.json({
            success: false,
            message: err.message
        });
    });
});

module.exports = router;
