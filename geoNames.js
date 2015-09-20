module.exports = {
	getRequest: function(zip, country, callback){
		var http = requrie('http');
		var credentials = require('./credentials.json');	

		var geoNamesURL = "api.geonames.org/postalCodeLookupJSON";
		var geoNamesUser = credentials.geoNamesUserName;
	
		var getRequest = geoNamesURL+"?postalcode="+zip+"&country="+country+"&username="+geoNamesUser;
		http.get(getRequest, function(err, res){
			if(err){
				console.log(err);
				return;
			}
			callback(JSON.parse(res.buffer.toString()).postalcodes[0]);
		});
	}
};
