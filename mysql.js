module.exports = {
	mysqlConnection: function(){
		var mysql = require('mysql');
		// connection
		var connection = mysql.createConnection({
			host: 'localhost',
			database: 'caretaker_dev',
			user: 'dev',
			password: 'dev',
			multipleStatements: true
		});
		// connection test
		connection.connect(function(err){
			if(err){
				console.log('error connecting: ' + err.stack);
				return;
			}
			console.log('connect as id ' + connection.threadId);
		});
		return connection;
	}


};

