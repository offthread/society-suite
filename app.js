var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var passport = require('passport');
var flash    = require('connect-flash');
var crontab = require('node-crontab');
var mysql = require('mysql');
var dbconfig = require('./config/database');

require('./config/passport')(passport); // pass passport for configuration

app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

var connection = mysql.createConnection(dbconfig.connection);

// Enable classifications every Friday at 00:00 (server is UTC)
var jobId = crontab.scheduleJob("0 3 * * 5", function(){
    connection.query('UPDATE rda_schema.users SET has_classified_this_week=0');
});

app.listen(3000, function () {

})

// launch ======================================================================Z