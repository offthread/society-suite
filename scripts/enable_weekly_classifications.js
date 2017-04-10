var bcrypt = require('bcrypt-nodejs')
var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('UPDATE rda_schema.users SET has_classified_this_week=0');
