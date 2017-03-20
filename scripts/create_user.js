var bcrypt = require('bcrypt-nodejs')
var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('INSERT INTO rda_schema.users (username, name, password, picture, is_admin) values ("felipe", "Felipe Vieira", "' + bcrypt.hashSync("123", null, null) + '", "https://scontent.frec3-1.fna.fbcdn.net/v/t1.0-9/15036567_10207722081152001_6679361468711902295_n.jpg?oh=009c6317f3a5cf92b5dacc1df0047aef&oe=596B21D0", 1)');

console.log('Success: User Created!')

connection.end();