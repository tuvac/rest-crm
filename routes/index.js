var express = require('express'),
	router = express.Router(),
	User = require('../models/user');

router.use('/login', require('./login'));
router.use('/register', require('./register'));

router.use(function(req, res, next) {

	 var token = req.body.token || req.query.token || req.headers['x-access-token'];

	 if (token) {

	 	var user = new User();

	 	user.authenticate(token)

	 		.then(function(decoded) {

	 			req.decoded = decoded
	 			next();
	 		})

	 		.catch(function(err) {
				
				return res.status(403).json({
					success: false,
					message: err.message
				});

	 		})

	 } else {

		return res.status(403).json({
			success: false,
			message: 'No token provided.'
		});

	 }
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('boom');
});

module.exports = router;
