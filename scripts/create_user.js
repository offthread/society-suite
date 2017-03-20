var bcrypt = require('bcrypt-nodejs')
var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('INSERT INTO rda_schema.users (id, username, password, is_admin) values (2, "paulo","' + bcrypt.hashSync("123", null, null) + '", 0)');

console.log('Success: User Created!')

connection.end();