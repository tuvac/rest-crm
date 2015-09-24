var fs = require('fs'),
	path = require('path'),
	basename = path.basename(module.filename),
	db = {};

fs.readdirSync(__dirname)
	
	.filter(function(file) {
		return (file.indexOf('.') !== 0) && (file !== basename);
	})
	.forEach(function(file) {
		var name = file.slice(0, file.lastIndexOf('.'));
		console.log(name);
	});