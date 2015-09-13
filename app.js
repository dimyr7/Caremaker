// set variables for environment
var express = require('express');
var path = require('path');
var http = require('http-request');
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
var geoNamesURL = "api.geonames.org/postalCodeLookupJSON";
var geoNamesUser = "dimyr7";
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
		req.checkBody('distance', 'Distance must be required and numeric').notEmpty().isInt();
		req.checkBody('language', 'You must provide a seccond language').notEmpty();
		req.checkBody('experience', 'You must provide experience in numerics').notEmpty().isInt();
		req.checkBody('email', 'You must provide an email').notEmpty();
		req.checkBody('price', 'You must provide a numeric price').notEmpty().isInt();
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
		console.log(req.body);
		var firstName = req.body.first_name;
		var lastName = req.body.last_name;
		var age = req.body.age;
		var town = req.body.town;
		var state = req.body.state;
		var zip = req.body.zip;
		var radius = (req.body.units == 'miles')? req.body.distance : req.body.distance * 1.609;
		var language = req.body.language;
		var experience = req.body.experience;
		var gender = req.body.gender;
		console.log(req.user.google);
		var origin = req.body.origin;
		var google_id = req.user.google.id;
		var email = req.body.email;
		var cook = (req.body.cook) ? 1 : 0;
		var clean = (req.body.clean) ? 1 : 0;
		var drive = (req.body.drive) ? 1 : 0;
		var skills = req.body.skills_explained;
		var bio = req.body.bio;
		var price = req.body.price;
		var pets = (req.body.pets) ? 1 : 0;
		var getRequest = geoNamesURL+"?postalcode="+zip+"&country="+"USA&username="+geoNamesUser;
		var pic_url = req.user.google.picture;
		//console.log(getRequest);
		http.get(getRequest, function(error, result){
			if (error) {
				console.error(error);
				return;
			}

			var geoJson = JSON.parse(result.buffer.toString()).postalcodes[0];
			var lat = geoJson.lat;
			var lon = geoJson.lng;
			var values = [firstName, lastName, town, state, zip, lat, lon, radius, language, experience, '1', gender, google_id, email, cook, clean, drive, skills, bio, price, pets, origin];
			console.log(values);
			var query = "INSERT INTO caretaker (`first_name`, `last_name`, `town`, `state`, `zip`, `x_coord`, `y_coord`, `radius`, `language`, `experience`, `gender`, `google_id`, `email`, `can_cook`, `can_clean`, `can_drive`, `skills_explanation`, `bio`, `price_range`, `pets_allowed`, `origins`, `pic_url`) VALUES ";
			var midquery = "(\'"+firstName+	"\', \'" +
								lastName +	"\', \'" + 
								town + 		"\', \'"+
								state+		"\', \'"+
								zip+		"\', \'"+
								lat+		"\', \'"+
								lon+		"\', \'"+
								radius+		"\', \'"+
								language+	"\', \'"+
								experience+	"\', \'"+
								gender+		"\', \'"+
								google_id+	"\', \'"+
								email+		"\', \'"+
								cook+		"\', \'"+
								clean+		"\', \'"+
								drive+		"\', \'"+
								skills+		"\', \'"+
								bio+		"\', \'"+
								price+		"\', \'"+
								pets+		"\', \'"+
								origin+		"\', \'"+
								pic_url+ 	"\');" ;
			console.log(query+midquery);
			connection.query(query+midquery, function(err){
				if(err){
					console.log(err);
				}
			});
		});

	}
	else{
		res.redirect('/');
	}
});

var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Listening at http://%s:%s', host, port);
});
