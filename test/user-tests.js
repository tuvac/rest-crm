var mongoose = require('mongoose'),
    assert = require('assert'),
    User = require('../models/user'),
    bcrypt = require('bcrypt'),
    salt = bcrypt.genSaltSync(10);

mongoose.connect('mongodb://localhost/rest-crm-test');


describe('User', function() {


    beforeEach(function(done) {

        this.timeout(5000);

        var password = bcrypt.hashSync('test1234', salt);

        var user = new User({
            username: 'someone@onthe.net',
            password: password,
            roles: ['USER']
        });
        user.save().then(function() {
            done();
        }).catch(done);
    });

    afterEach(function(done) {

        this.timeout(5000);

        mongoose.connection.db.dropDatabase(function(err) {
            done(err);
        });
    });

    describe('#register', function() {

        it('Should save a user with a default role', function(done) {

            var user = new User();

            user.register('test@test.net', 'test1234')

            .then(function(user) {

                    assert.ok(user.id);
                    assert.equal(user.roles.length, 1);
                    assert.equal(user.roles[0], 'USER');
                    done();
                })
                .catch(function(err) {

                    console.log(err);
                    done(err);
                });
        });

        it('Should save a user with set roles', function(done) {

            var user = new User();

            user.register('test@test.com', 'test1234', ['ADMIN', 'USER'])

            	.then(function(user) {

                    assert.ok(user.id);
                    assert.equal(user.roles.length, 2);
                    assert.equal(user.roles[0], 'ADMIN');
                    assert.equal(user.roles[1], 'USER');
                    done();
                })
                
                .catch(function() {

                    console.log(err);
                    done(err);
                });

        });

    });

    describe('#hasRole', function() {

        it('Should return true if user has supplied role', function() {

            var user = new User();

            user.roles.push('ADMIN');
            
            var count = 0;
            
            user.hasRole('USER')
			
				.then(function(u) {
			
					assert.ok(false);
				})
			
				.catch(function(err) {
				
					count++;
					assert.ok(true);
				
				});

            user.hasRole('ADMIN')
            
				.then(function(u) {
			
					count++;
					assert.ok(true);
				})
			
				.catch(function(err) {
				
					assert.ok(false);
				})
			
				.done(function() {
				
					assert.equal(count, 2);
				});

        });

    });
    
    describe('#login', function() {
    	
    	it('Should validate user using username and password', function(done) {
    		
    		var user = new User();
    		
    		user.login('someone@onthe.net', 'test1234')
    		
				.then(function(u) {
				
    			    assert.equal(u.username, 'someone@onthe.net');
    				return u.hasRole('USER');
    			})
    			
    			.then(function(u) {
    			
    				return u.getToken();
    			})
    			
    			.then(function(u) {

    				done();
    			})
    			
    			.catch(done);
    	});
    	
    	it('Should validate user using username and password but reject due to role', function(done) {
    		
    		var user = new User();
    		
    		user.login('someone@onthe.net', 'test1234')
    		
				.then(function(u) {
				
    			    assert.equal(u.username, 'someone@onthe.net');
    				return u.hasRole('ADMIN');
    			})
    			
    			.then(function(u) {
    			
    				assert.ok(false);
    			})
    			
    			.catch(function(err) {

    				assert.ok(err)
    				
    			})
    			
    			.done(done);
    	});    	
    	
    });
    
    describe('#getToken', function() {
    	
    	it('Should throw an error if we attempt to get a token for an unsaved user', function(done) {
    	
    		var user = new User({username: 'another@test.com', passowrd: '123456', roles: ['USER']})
    		
    		user.getToken()
    		
    			.then(done)
    			
    			.catch(function(err) {
    				
    				assert.equal(err.message, 'No user to tokenize');
    				
    			})
    			
    			.done(done);
    	});
    	
    	it('Should ');
    });

});