
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
	  	res.render('classifier/classifier.html');
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