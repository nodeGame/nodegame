module.exports = configure;

var request = require('request');
var NDDB = require('NDDB').NDDB;

var codes = new NDDB();

var body = {
		 "Operation": "GetCodes",
		 "ServiceKey": "18F072F7850A4BBEB3EF6A372CBECEE3",
		 "ProjectCode":"7D1503C55EC44EF1A7B31CEB69E8498C",
		 "AccessCode":"",
		 "ExitCode":"",
		 "Bonus":0,
		 "Payoffs":[],
		 "Codes":[]
};

request(
	    { method: 'POST'
	    , uri: 'https://www.descil.ethz.ch/apps/mturk2/api/service.ashx'
	    , json: body
	    }
	  , function (error, response, body) {
		  if (error) {
			  console.log(error);
			  console.log('Error. Cannot proceed without the list of valid access codes');
			  throw new Error(error);
		  }
		  console.log('Response code: '+ response.statusCode);
	      codes.importDB(body.Codes);
	      console.log(codes.fetchValues());
	    }
);

function configure (app) {
	

//	app.all('*', requireAuthentication, loadUser);
	// authentication
//	app.get('/ultimatum/admin', function(req, res) {
//		var auth = false;
//		if (auth) {
//			var url = 'http://www.google.com';
//	    	res.redirect(url);
//		}
//	});
//	
	var url = 'http://google.com';
	
	app.param('game', function(req, res, next, game){
		  if (game !== 'ultimatum') next();
			  
		  if (!req.query || !req.query.id) {
			  res.redirect(url);
			  return;
		  }
		  
		  var found =  codes.select('AccessCode', '=', req.query.id).first();
		  
		  if (!found) {
			  res.send('Your code is invalid. An administrator has benn contacted.');
			  return;
		  }
			  
		  next();
	});
	
	
	return true;
}