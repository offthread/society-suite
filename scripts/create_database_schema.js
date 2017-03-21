var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

//connection.query('CREATE DATABASE ' + dbconfig.database);

// connection.query('\
// CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
//     `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
//     `username` VARCHAR(20) NOT NULL, \
//     `name` VARCHAR(20) NOT NULL,\
//     `password` CHAR(60) NOT NULL, \
//     `picture` VARCHAR(500) NOT NULL, \
//     `is_admin` TINYINT(1) NOT NULL, \
//         PRIMARY KEY (`id`), \
//     UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
//     UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
// )');

// connection.query('\
// CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.classifications_table + '` ( \
//     `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
//     `created_time` DATETIME NOT NULL, \
//     `classifier` INT UNSIGNED NOT NULL,\
//     `classified` INT UNSIGNED NOT NULL, \
//     `classification` INT NOT NULL,\
//     UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
// )');

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.teams_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `year` INT NOT NULL, \
    `month` INT NOT NULL,\
    `color` VARCHAR(20) NOT NULL, \
    `players` JSON NOT NULL,\
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
)');

console.log('Success: Database Created!')

connection.end();