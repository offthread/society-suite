
var dbconfig = require('../config/database');
var mysql = require('mysql');


// app/routes.js
module.exports = function(app, passport) {
	app.engine('html', require('ejs').renderFile);

	app.get('/login', function (req, res) {
	  res.render('misc/login.html');
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

	  	// Fetch user's last classifications
	  	connection.query('SELECT * '
	  		+ 'FROM rda_schema.classifications '
	  		+ 'WHERE classifier=' + req.user.id
	  		+ ' AND created_time='
	  		+ '(SELECT MAX(created_time) FROM rda_schema.classifications WHERE classifier=' + req.user.id + ')',
	  		 function (error, results, fields) {
		  if (error) throw error;
		  last_classifications = results
		  connection.query('SELECT * from rda_schema.users', function (error, results, fields) {
			  if (error) throw error;
			  res.render('classifier/classifier.ejs', {users: results, last_classifications: last_classifications});
			});
		});
	  }
	  else {
	  	res.redirect('/login');
	  }
	})

	app.post('/classifier', function (req, res) {
		var connection = mysql.createConnection(dbconfig.connection);

		connection.query('SELECT has_classified_this_week from rda_schema.users WHERE id=' + req.user.id, function (error, results, fields) {
		  if (error) throw error;

		  if (results.length > 0) {
			  if (results[0].has_classified_this_week == 1) {
			  	res.statusCode = 401;
				res.send('None shall pass');
				return;
			  }
			  else {

			  	classifications = req.body.classifications
				for (var i = 0; i < classifications.length; i++) {
					classification = classifications[i]
					if (classification[1].length > 0) {
						connection.query('INSERT INTO rda_schema.classifications (created_time, classifier, classified, classification) values(' + connection.escape(new Date()) + ', ' + req.user.id + ', ' + classification[0] + ', ' + classification[1] + ')');
					}
					res.statusCode = 200;
				}
				connection.query('UPDATE rda_schema.users SET has_classified_this_week=1 WHERE id=' + req.user.id, function (error, results, fields) {
					res.send('Sucessful');
					return;
				})

			  }
		  }
		  else {
		  	classifications = req.body.classifications
			for (var i = 0; i < classifications.length; i++) {
				classification = classifications[i]
				if (classification[1].length > 0) {
					connection.query('INSERT INTO rda_schema.classifications (created_time, classifier, classified, classification) values(' + connection.escape(new Date()) + ', ' + req.user.id + ', ' + classification[0] + ', ' + classification[1] + ')');
				}
			}
			res.statusCode = 200;
			connection.query('UPDATE rda_schema.users SET has_classified_this_week=1 WHERE id=' + req.user.id, function (error, results, fields) {
					res.send('Sucessful');
					return;
				})
			res.send('Sucessful');
		  }
		});

	})

	app.post('/draw_teams', function (req, res) {
		var connection = mysql.createConnection(dbconfig.connection);

		classifications_start_time = new Date()
		classifications_start_time.setDate(classifications_start_time.getDate()-30);

		classifications_end_time = new Date()

		connection.query("SELECT classified, ROUND(AVG(classification),2) AS average_value"
		 + " FROM rda_schema.classifications"
		 + " WHERE created_time BETWEEN " + connection.escape(classifications_start_time) + " AND " + connection.escape(classifications_end_time)
		 + " GROUP BY classified"
		 + " ORDER BY average_value DESC", function(err, rows, fields) {
			if (err) throw err;
			group_one = shuffle(rows.slice(0,3))
			group_two = shuffle(rows.slice(3,6))
			group_three = shuffle(rows.slice(6,9))
			group_four = shuffle(rows.slice(9,12))
			group_five = shuffle(rows.slice(12,15))
			group_six = shuffle(rows.slice(15,18))
			group_seven = shuffle(rows.slice(18,21))
			group_eight = shuffle(rows.slice(21,24))

			red_team = [group_one[0], group_two[0], group_three[0], group_four[0], group_five[0], group_six[0], group_seven[0], group_eight[0]]
			green_team = [group_one[1], group_two[1], group_three[1], group_four[1], group_five[1], group_six[1], group_seven[1], group_eight[1]]
			yellow_team = [group_one[2], group_two[2], group_three[2], group_four[2], group_five[2], group_six[2], group_seven[2], group_eight[2]]

			now = new Date()
			json_red_team = '{ "data": ' + JSON.stringify(red_team) + '}'
			json_yellow_team = '{ "data": ' + JSON.stringify(yellow_team) + '}'
			json_green_team = '{ "data": ' + JSON.stringify(green_team) + '}'

			connection.query('INSERT INTO rda_schema.teams (year, month, color, players) VALUES '
			 + '(' + now.getFullYear() + ', ' + now.getMonth() + ', "red", ' + connection.escape(json_red_team) + ')')

			connection.query('INSERT INTO rda_schema.teams (year, month, color, players) VALUES '
			 + '(' + now.getFullYear() + ', ' + now.getMonth() + ', "yellow", ' + connection.escape(json_yellow_team) + ')')

			connection.query('INSERT INTO rda_schema.teams (year, month, color, players) VALUES '
			 + '(' + now.getFullYear() + ', ' + now.getMonth() + ', "green", ' + connection.escape(json_green_team) + ')')

			res.redirect('/');
		})

	})

	app.get('/', function (req, res) {
		var connection = mysql.createConnection(dbconfig.connection);
		now = new Date()
		current_year = now.getFullYear()
		current_month = now.getMonth()

		var monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
		  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
		];
		month = monthNames[current_month]

		connection.query('SELECT * FROM rda_schema.teams WHERE year='  + current_year + ' AND month=' + current_month, function(err, rows, fields) {
			if (err) throw err;
			red_team_data = null
			yellow_team_data = null
			green_team_data = null

			for (var i = 0; i < rows.length; i++) {
				if (rows[i].color == 'red') {
					red_team = rows[i]
					red_team_data = JSON.parse(rows[i].players).data
				}
				if (rows[i].color == 'yellow') {
					yellow_team = rows[i]
					yellow_team_data = JSON.parse(rows[i].players).data
				}
				if (rows[i].color == 'green') {
					green_team = rows[i]
					green_team_data = JSON.parse(rows[i].players).data
				}
			}

			connection.query('SELECT id, name, picture FROM rda_schema.users', function(err, rows, fields) {
				user_mapping = {}
				for (var i = 0; i < rows.length; i++) {
					user_mapping[parseInt(rows[i].id)] = [rows[i].name, rows[i].picture]
				}

				res.render('teams/team_list.ejs');
			})

		})


	})

	app.get('/selector', function (req, res) {
	  if (req.user) {
	  	if (req.user.is_admin) {
		  	res.render('misc/module_selector.html');
		  }
		  else {
		  	res.redirect('/classifier');
		  }
	  }
	  else {
	  	res.redirect('/login');
	  }

	});

	/**
	 * Shuffles array in place.
	 * @param {Array} a items The array containing the items.
	 */
	function shuffle(a) {
	    var j, x, i;
	    for (i = a.length; i; i--) {
	        j = Math.floor(Math.random() * i);
	        x = a[i - 1];
	        a[i - 1] = a[j];
	        a[j] = x;
	    }

	    return a
	}
}