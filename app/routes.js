
var dbconfig = require('../config/database');
var mysql = require('mysql');


// app/routes.js
module.exports = function(app, passport) {
	app.engine('html', require('ejs').renderFile);

	app.get('/login', function (req, res) {
	  res.render('classifier/login.html');
	})

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/selector', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });


	app.get('/classifier', function (req, res) {
	  if(req.user) {
	  	var connection = mysql.createConnection(dbconfig.connection);
	  	connection.query('SELECT * from rda_schema.users', function (error, results, fields) {
		  if (error) throw error;
		  res.render('classifier/classifier.ejs', {users: results});
		});

	  }
	  else {
	  	res.redirect('/login');
	  }
	})

	app.get('/selector', function (req, res) {
	  if (req.user.is_admin) {
	  	res.render('misc/module_selector.html');
	  }
	  else {
	  	res.redirect('/classifier');
	  }

	})
}