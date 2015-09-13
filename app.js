// set variables for environment
var express = require('express');
var path = require('path');
var http = require('http');
var async = require('async');
var request = require('request');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var session = require('express-session');
var everyauth = require('everyauth');
var connection = require('./mysql.js').mysqlConnection();
var gAuth = require('./googleAuth.js').googleAuth;
var validator = require('express-validator');
var util = require('util');
console.log(gAuth);
var x = gAuth();
// router creation
var app = express();
var router = express.Router();

// view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app config
app.use(express.static(path.join(__dirname, 'public')))
.use(session({secret: 'dima'}))
.use(bodyParser.urlencoded({extended: false}))
.use(bodyParser.json())
.use(cookieParser())
.use(everyauth.middleware())
.use('/', router).
use(validator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.');
		var root    = namespace.shift();
		var  formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));

router.use('/', function(req, res, next){
	console.log('time: '+ Date.now());
	

	next();
});

app.get('/', function(req, res){
	if(req.session && req.session.auth && req.session.auth.loggedIn){
		res.redirect('/dashboard');
	}
	else{
		res.render('index', {logged_in: false, current: 'home'});
	}
	

});

app.get('/home', function(req, res){
	res.redirect('/');
});

app.get('/about', function(req, res){
	if(req.session && req.session.auth && req.session.auth.loggedIn){
		res.render('about', {logged_in: true, google: req.user.google, current: 'about'});	
	}
	else{
		res.render('about', {logged_in:false, current: 'about'});
	}
});
app.get('/contact', function(req, res){
	if(req.session && req.session.auth && req.session.auth.loggedIn){
		res.render('contact', {logged_in: true, google: req.user.google, current: 'contant'});	
	}
	else{
		res.render('contact', {logged_in:false, current: 'contant'});
	}
});

app.get('/dashboard', function(req, res){
	//console.log(req.session);
	//console.log(req.session.auth);
	//console.log(req.session.auth.loggedIn);
	if(req.session && req.session.auth && req.session.auth.loggedIn){
		var google_data = req.user.google;
		//console.log(google_data);
		var new_user_query = "SELECT * FROM caretaker WHERE 'google_id'= ?";
		connection.query(new_user_query, [google_data.id], function(err, result){
			if(err){
				console.log("error checking for new user: " + err.stack);
			}
			if(result.length === 0){ // new user
				res.redirect('new_user');	
			}
			else{
				res.render('contant', {logged_in:false, current: 'contant'});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

app.get('/new_user', function(req, res){
	if(req.session && req.session.auth && req.session.auth.loggedIn){
		res.render('new_user', {google: req.user.google, errors: []});
	}
	else{
		res.redirect('/');
	}
});

app.post('/', function(req, res){
	if(req.session && req.session.auth && req.session.auth.loggedIn){
		req.checkBody('first_name', 'First name is rquired').notEmpty();
		req.checkBody('last_name', 'Last name is required').notEmpty();
		req.checkBody('town', ' Town is required').notEmpty();
		req.checkBody('state', 'State is required').notEmpty();
		req.checkBody('zip', 'Zip code is required and numeric').notEmpty().isInt();
		req.checkBody('zip', 'Distance must be required and numeric').notEmpty().isInt();
		req.checkBody('language', 'You must provide a seccond language').notEmpty();
		req.checkBody('email', 'You must provide an email').notEmpty();
		req.checkBody('price', 'You must provide a numeric price').notEmpty().isInt();
		console.log(req.body);
		var errors = req.validationErrors();
		if (errors) {
			//console.log(errors);
			res.status(400).render('new_user', {google: req.user.google, errors: errors});
			return;
		}
		res.json({
			urlparam: req.params.urlparam,
			getparam: req.params.getparam,
			postparam: req.params.postparam
		});
		res.send('POST request to the homepage');
	}
	else{
		res.redirect('/');
	}
});

var server = app.listen(80, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Listening at http://%s:%s', host, port);
});
