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
    
    user.register(data.username, data.password)
    	
    	.then(function(user) {
    		
    		console.log('Created new user with id ' + user.id);
			res.json({
				success: true,
				message: 'You have been registered'
			}); 
    	})
    	
    	.catch(function(err) {

			res.json({
				success: false,
				message: err.message
			});
    	});

});

module.exports = router;