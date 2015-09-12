var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	database: 'caretaker_dev',
	user: 'dev',
	password: 'dev_pass',
	multipleStatements: true
});

var delete_query = "TRUNCATE `caretaker_dev`.`location`"; 
connection.query(delete_query, function(err){
	if(err){
		console.log("error truncating:" + err.stack);
		}
})

var locations = require('./locations.json');

var insert_query= "INSERT INTO location (city, country, region)  VALUES ?";
connection.query(insert_query, [locations], function(err){
	if(err){
		console.log("error inserting: "+ err.stack);
	}	
	connection.end();
});


//console.log(locations);
