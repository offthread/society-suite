
var express = require('express')
var app = express()

app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


app.get('/sorteador', function (req, res) {
  res.render('classifier.html');
})

app.get('/nivelador', function (req, res) {
  res.render('leveler.html');
})


app.listen(3000, function () {
})