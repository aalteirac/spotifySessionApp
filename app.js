var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Session = require('express-session');

var main = require('./routes/main');

var app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');


//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(Session({secret:'anthony',
                    saveUninitialized: true,
					cookie:{ maxAge  : 1000*60*28 },
                    resave: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile('login.html', { root: __dirname + "/public" } );
});

app.use('/main', main);


app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});

module.exports = app;
