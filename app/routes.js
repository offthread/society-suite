'use strict';

const dbconfig = require('../config/database');
const mysql = require('mysql');
const randomstring = require('randomstring');
const async = require('async');
const bcrypt = require('bcrypt-nodejs')

// app/routes.js
module.exports = function(app, passport) {
  app.engine('html', require('ejs').renderFile);

  app.get('/login', (req, res) => {
    res.render('misc/login.html');
  })

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/selector', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
    }),
        (req, res) => {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });


  app.get('/classifier', (req, res) => {
    if(req.user) {
      var connection = mysql.createConnection(dbconfig.connection);

      // Fetch user's last classifications
      connection.query(
        'SELECT * '
        + 'FROM rda_schema.classifications '
        + 'WHERE classifier=' + req.user.id
        + ' AND created_time='
        + '(SELECT MAX(created_time) FROM rda_schema.classifications WHERE classifier=' + req.user.id + ')',
        function (error, results, fields) {
          if (error) throw error;
          let last_classifications = results
          connection.query('SELECT * from rda_schema.users', function (error, results, fields) {
            if (error) throw error;
            res.render('classifier/classifier.ejs', { users: results, last_classifications: last_classifications });
          });
      });
    }
    else {
      res.redirect('/login');
    }
  });

  app.post('/classifier', (req, res) => {
    var connection = mysql.createConnection(dbconfig.connection);

    connection.query('SELECT has_classified_this_week from rda_schema.users WHERE id=' + req.user.id, function (error, results, fields) {
      if (error) throw error;

      if (results.length > 0) {
        if (results[0].has_classified_this_week == 1) {
          res.statusCode = 401;
          res.send('None shall pass');
          return;
        } else {
          let classifications = req.body.classifications
          for (var i = 0; i < classifications.length; i++) {
            let classification = classifications[i]
            if (classification[1].length > 0) {
              connection.query('INSERT INTO rda_schema.classifications (created_time, classifier, classified, classification) values(' + connection.escape(new Date()) + ', ' + req.user.id + ', ' + classification[0] + ', ' + classification[1] + ')');
            }
            res.statusCode = 200;
          }
          connection.query('UPDATE rda_schema.users SET has_classified_this_week=1 WHERE id=' + req.user.id, function (error, results, fields) {
            res.send('Sucessful');
            return;
          });
        }
      } else {
        let classifications = req.body.classifications
        for (var i = 0; i < classifications.length; i++) {
          let classification = classifications[i]
          if (classification[1].length > 0) {
            connection.query('INSERT INTO rda_schema.classifications (created_time, classifier, classified, classification) values(' + connection.escape(new Date()) + ', ' + req.user.id + ', ' + classification[0] + ', ' + classification[1] + ')');
          }
        }
        res.statusCode = 200;
        connection.query('UPDATE rda_schema.users SET has_classified_this_week=1 WHERE id=' + req.user.id, function (error, results, fields) {
          if (error) throw error;
          res.send('Sucessful');
          return;
        });
      }
    });
  });

  app.post('/draw_teams', (req, res) => {
    var connection = mysql.createConnection(dbconfig.connection);

    let classifications_start_time = new Date();
    classifications_start_time.setDate(classifications_start_time.getDate() - 30);

    let classifications_end_time = new Date();

    connection.query(
      "SELECT classified, ROUND(AVG(classification),2) AS average_value"
      + " FROM rda_schema.classifications"
      + " WHERE created_time BETWEEN " + connection.escape(classifications_start_time) + " AND " + connection.escape(classifications_end_time)
      + " GROUP BY classified"
      + " ORDER BY average_value DESC", function(err, rows, fields) {
        if (err) throw err;
        let group_one = shuffle(rows.slice(0,3));
        let group_two = shuffle(rows.slice(3,6));
        let group_three = shuffle(rows.slice(6,9));
        let group_four = shuffle(rows.slice(9,12));
        let group_five = shuffle(rows.slice(12,15));
        let group_six = shuffle(rows.slice(15,18));
        let group_seven = shuffle(rows.slice(18,21));
        let group_eight = shuffle(rows.slice(21,24));

        let red_team = [group_one[0], group_two[0], group_three[0], group_four[0], group_five[0], group_six[0], group_seven[0], group_eight[0]];
        let green_team = [group_one[1], group_two[1], group_three[1], group_four[1], group_five[1], group_six[1], group_seven[1], group_eight[1]];
        let yellow_team = [group_one[2], group_two[2], group_three[2], group_four[2], group_five[2], group_six[2], group_seven[2], group_eight[2]];

        let now = new Date();
        let json_red_team = '{ "data": ' + JSON.stringify(red_team) + '}';
        let json_yellow_team = '{ "data": ' + JSON.stringify(yellow_team) + '}';
        let json_green_team = '{ "data": ' + JSON.stringify(green_team) + '}';

        connection.query('INSERT INTO rda_schema.teams (year, month, color, players) VALUES '
        + '(' + now.getFullYear() + ', ' + now.getMonth() + ', "red", ' + connection.escape(json_red_team) + ')');d

        connection.query('INSERT INTO rda_schema.teams (year, month, color, players) VALUES '
        + '(' + now.getFullYear() + ', ' + now.getMonth() + ', "yellow", ' + connection.escape(json_yellow_team) + ')');

        connection.query('INSERT INTO rda_schema.teams (year, month, color, players) VALUES '
        + '(' + now.getFullYear() + ', ' + now.getMonth() + ', "green", ' + connection.escape(json_green_team) + ')');

        res.redirect('/');
      });
  });

  app.get('/', (req, res) => {
    let connection = mysql.createConnection(dbconfig.connection);
    let now = new Date();
    let current_year = now.getFullYear();
    let current_month = now.getMonth();

    var monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    let month = monthNames[current_month];

    connection.query('SELECT * FROM rda_schema.teams WHERE year='  + current_year + ' AND month=' + current_month, function(err, rows, fields) {
      if (err) throw err;
      let red_team;
      let red_team_data;
      let yellow_team;
      let yellow_team_data;
      let green_team;
      let green_team_data;

      for (var i = 0; i < rows.length; i++) {
        if (rows[i].color == 'red') {
          red_team = rows[i];
          red_team_data = JSON.parse(rows[i].players).data;
        }
        if (rows[i].color == 'yellow') {
          yellow_team = rows[i];
          yellow_team_data = JSON.parse(rows[i].players).data;
        }
        if (rows[i].color == 'green') {
          green_team = rows[i];
          green_team_data = JSON.parse(rows[i].players).data;
        }
      }

      connection.query('SELECT id, name, picture FROM rda_schema.users', function(err, rows, fields) {
        let user_mapping = {}
        for (var i = 0; i < rows.length; i++) {
          user_mapping[parseInt(rows[i].id)] = [rows[i].name, rows[i].picture];
        }

        res.render('teams/team_list.ejs', {
          month,
          current_year,
          red_team,
          red_team_data,
          yellow_team,
          yellow_team_data,
          green_team,
          green_team_data,
          user_mapping
        });
      });
    });
  });

  app.get('/selector', (req, res) => {
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

  app.get('/forgot-password', (req, res) => {
    res.render('misc/forgot-password.html');
  });

  app.post('/forgot-password', (req, res) => {
    if (!req.body.email) {
      res.send('Email inválido').status(400);
      return;
    }
    let connection = mysql.createConnection(dbconfig.connection);
    async.waterfall([
      (cb) => {
        connection.query(`SELECT id, name, email FROM rda_schema.users WHERE email = '${req.body.email}'`, (err, rows, fields) => {
          if (err) return cb(err);

          if (!rows.length) {
            res.send('Usuário não encontrado!').status(404);
            return;
          }
          let user = rows[0];
          let reset_token = randomstring.generate(32);
          let emailText = `Olá, ${user.name}!

    Você solicitou que sua senha fosse redefinida. Clique no link abaixo para definir uma nova senha.

    http://rdamigles.com/reset-password/${reset_token}

    Obrigado.`
          user.reset_token = reset_token;
          cb(null, user);
        });
      },
      (user, cb) => {
        connection.query(`UPDATE rda_schema.users SET reset_token = '${user.reset_token}' where id = ${user.id}`, (err) => {
          return cb(err, user);
        });
      }
    ], (err, user) => {
      if (err) throw err;
      res.send(`Email enviado para ${user.email}`);
    });
  });

  app.get('/reset-password/:reset_token', (req, res) => {
    let connection = mysql.createConnection(dbconfig.connection);
    connection.query(`SELECT id FROM rda_schema.users WHERE reset_token = '${req.params.reset_token}'`, (err, rows, fields) => {
      if (err) throw err;
      if (!rows.length) {
        res.send('Usuário não encontrado!').status(404);
        return;
      }
      res.render('misc/reset-password.html');
    });
  });

  app.post('/reset-password/:reset_token', (req, res) => {
    if (!req.body.password || req.body.password.length < 3) {
      res.send('Senha inválida!').status(400);
      return;
    }
    if (!req.body.passwordConfirm || req.body.password !== req.body.passwordConfirm) {
      req.send('As senhas devem ser iguais!').status(400);
      return;
    }

    let connection = mysql.createConnection(dbconfig.connection);

    async.waterfall([
      (cb) => {
        connection.query(`SELECT id FROM rda_schema.users WHERE reset_token = '${req.params.reset_token}'`, (err, rows, fields) => {
          if (err) return cb(err);

          if (!rows.length) {
            res.send('Usuário não encontrado!').status(404);
            return;
          }
          let user = rows[0];
          cb(null, user.id);
        });
      },
      (userId, cb) => {
        let newPassword = bcrypt.hashSync(req.body.password, null, null);
        connection.query(`UPDATE rda_schema.users SET reset_token = NULL, password = '${newPassword}' WHERE id = ${userId}`, cb);
      }
    ], (err) => {
      if (err) throw err;
      res.send('Senha redefinida!');
    });
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

    return a;
  }
}