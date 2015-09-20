// set variables for environment
var express = require('express'); // router for node.js
var path = require('path'); 
var http = require('http-request');
var request = require('request');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var validator = require('express-validator');
var util = require('util');
var credentials = require('./credentials.json');

var geoNames = require('./geoNames.js');
var connection = require('./mysql.js').mysqlConnection();


// router creation
var app = express();
var router = express.Router();

// google Matrix API
var googleMatrixURL = "https://maps.googleapis.com/maps/api/distancematrix/json";
var googleMatrixKey = credentials.googleMatrixKey;

// google authenication
var GOOGLE_CLIENT_ID =  credentials.googleClientID;
var GOOGLE_CLIENT_SECRET = credentials.googleClientSecret;
var GOOGLE_SCOPES = ['https://www.googleapis.com/auth/userinfo.profile'];

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
		clientID: GOOGLE_CLIENT_ID,
		clientSecret: GOOGLE_CLIENT_SECRET,
		callbackURL: "/auth/google/callback"
	},
	function(accessToken, refreshToken, profile, done){
		console.log("WHATTTT");
		return done(null, profile);
	})
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

// view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app config
app.use(express.static(path.join(__dirname, 'public')))
.use(session({secret: 'dima'}))
.use(passport.initialize())
.use(passport.session())
.use(bodyParser.urlencoded({extended: false}))
.use(bodyParser.json())
.use(cookieParser())
.use('/', router)
.use(validator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.');
		var root    = namespace.shift();
		var formParam = root;

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

// router middleware
router.use('/', function(req, res, next){
	console.log(req.isAuthenticated());
	console.log(req.user);
	if(req.isAuthenticated()){
		next();
	}
	else if(req.path == "/"){
		next();
	}
	else if(req.path == "/about"){
		next();
	}
	else if(req.path == "/contact"){
		next();
	}
	else if(req.path == "/login"){
		next();
	}
	else if(req.path == '/auth/google'){
		next();
	}
	else if(req.path == '/auth/google/callback'){
		next();
	}
	else{
		res.redirect('/login');
	}
});

app.get('/', function(req, res){
	if(req.isAuthenticated()){
		res.render('index', {logged_in: true, user: req.user, current_header: 'home'});
	}
	else{
		res.render('index', {logged_in: false, current_header: 'home'});
	}
});

app.get('/about', function(req, res){
	if(req.isAuthenticated()){
		res.render('about', {logged_in: true, user: req.user, current_header: 'about'});	
	}
	else{
		res.render('about', {logged_in:false, current_header: 'about'});
	}
});

app.get('/contact', function(req, res){
	if(req.isAuthenticated()){
		res.render('contact', {logged_in: true, user: req.user, current_header: 'contact'});	
	}
	else{
		res.render('contact', {logged_in:false, current_header: 'contact'});
	}
});

app.get('/login', function(req, res){
	if(req.isAuthenticated()){
		res.redirect('/dashboard');
	}
	res.render('login', {logged_in: false, current_header: 'user'});

});
app.get('/dashboard', function(req, res){
	
	res.render('dashboard', {logged_in:true, user: req.user, current_header: 'user'});
});

app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/login'}), function(req, res){
	res.redirect('/dashboard');
});
app.get('/auth/google', passport.authenticate('google', { scope: GOOGLE_SCOPES}));


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
		var firstName = connection.escape(req.body.first_name);
		var lastName = connection.escape(req.body.last_name);
		var age = connection.escape(req.body.age);
		var town = connection.escape(req.body.town);
		var state = connection.escape(req.body.state);
		var zip = connection.escape(req.body.zip);
		var radius = (req.body.units == 'miles')? connection.escape(req.body.distance) : connection.escape(req.body.distance * 1.609);
		var language = connection.escape(req.body.language);
		var experience = connection.escape(req.body.experience);
		var gender = connection.escape(req.body.gender);
		console.log(req.user.google);
		var origin = connection.escape(req.body.origin);
		var google_id = connection.escape(req.user.google.id);
		var email = connection.escape(req.body.email);
		var cook = (req.body.cook) ? 1 : 0;
		var clean = (req.body.clean) ? 1 : 0;
		var drive = (req.body.drive) ? 1 : 0;
		var skills = connection.escape(req.body.skills_explained);
		var bio = connection.escape(req.body.bio);
		var price = connection.escape(req.body.price);
		var pets = (req.body.pets) ? 1 : 0;
				var pic_url = connection.escape(req.user.google.picture);
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
			var midquery = "("+firstName+	", " +
								lastName +	", " + 
								town + 		", "+
								state+		", "+
								zip+		", "+
								lat+		", "+
								lon+		", "+
								radius+		", "+
								language+	", "+
								experience+	", "+
								gender+		", "+
								google_id+	", "+
								email+		", "+
								cook+		", "+
								clean+		", "+
								drive+		", "+
								skills+		", "+
								bio+		", "+
								price+		", "+
								pets+		", "+
								origin+		", "+
								pic_url+ 	");" ;
			console.log(query+midquery);
			connection.query(query+midquery, function(err){
				if(err){
					console.log(err);
				}
				else{
					res.redirect('/');
				}
			});
		});

	}
	else{
		res.redirect('/');
	}
});

app.get('/get/caretaker', function(req ,res){
	var town = req.query.town;
	var state = req.query.state;
	var zip = req.query.zip;
	geoNames.getRequest(zip, 'USA', function(res){	

		var lat = res.lat;
		var lon = res.lng;
	
		var query = "SELECT * FROM `caretaker` WHERE (`x_coord` < "+(lat+1)+" AND `x_coord` > "+(lat-1)+") AND (`y_coord` < "+(lon+1)+" AND `y_coord` > "+(lon-1)+");";
		connection.query(query, function(err ,result1){
			if(err){
				console.log(err.stack);
				return;
			}
			var googleQuery = googleMatrixURL+"?units=imperial&origins="+town+"+"+state+"+"+zip+"&key="+googleMatrixKey+"&destinations=";
			for(var i = 0; i < result1.length-1; i++){
				googleQuery+=result1[i].town+"+"+result1[i].state+"+"+result1[i].zip+"|";
			}
			var resultLength = result1.length;
			googleQuery+=result1[resultLength-1].town+"+"+result1[resultLength-1].state+"+"+result1[resultLength-1].zip;
			http.get(googleQuery, function(error2, result2){
				if(error2){

					console.error(error2);
					return;
				}
				var distance = JSON.parse(result2.buffer.toString());
				console.log(distance.rows[0]);
				//res.send(distance.rows[0].elements);
				for(var i = 0; i < distance.rows[0].elements.length; i++){
					result1[i].distance = distance.rows[0].elements[i].distance.text;
					result1[i].value = distance.rows[0].elements[i].distance.value;
				}
				res.send(result1);
							
			});
		});
	});


});

app.post('/post/customer', function(req, res){
	var first_name = connection.escape(req.body.first_name);
	var last_name = connection.escape(req.body.last_name);
	var age = connection.escape(req.body.age);
	var town =  connection.escape(req.body.town);
	var state = connection.escape(req.body.state);
	var zip = connection.escape(req.body.zip);
	var language = connection.escape(req.body.language);
	var gender = connection.escape(req.body.gender);
	var pic_url = connection.escape(req.body.pic);
	var email = connection.escape(req.body.email);
	var google_id = connection.escape(req.body.google);
	var geoNamesInfo = geoNames.getRequest(zip, 'USA', function(res){
	var lat = res.lat;
		var lon = res.lng;
	
		var query = "INSERT INTO `customer` (`first_name`, `last_name`, `age`, `town`, `state`, `zip`, `x_coord`, `y_coord`, `language`, `gender`, `profile_pic`, `email`, `google_id`) VALUES ";
		var midquery = "("+firstName+", "+lastName+","+age+", "+town+","+state+","+zip+","+lat+","+lon+","+language+","+gender+","+pic_url+","+email+","+google_id+");";

		connection.query(query+midquery, function(err){
			if(err){
				console.log(err.stack);
				return;
			}
			res.status(200).send('Yo bitch');
		});
	});

				
		



});

var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Listening at http://%s:%s', host, port);
});
