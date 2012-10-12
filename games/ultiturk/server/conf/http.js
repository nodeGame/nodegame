module.exports = configure;

var request = require('request'),
	NDDB = require('NDDB').NDDB,
	dk = require('descil-mturk');

function configure (app) {
	
	dk.getCodes();

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
	
	app.param('game', function(req, res, next, game) {
		  if (game !== 'ultimatum') {
			  next();
			  return;
		  }
		  if (req.params[0] !== 'room.html') {
			  //console.log('req0 ' + req.params[0]);
			  next();
			  return;
		  }
		  
		  if (!req.query || !req.query.id) {
			  res.send('You cannot access this page without a valid access code. An administrator has been contacted.');
			  //res.redirect(url);
			  return;
		  }
		  
		  var found =  dk.codes.select('AccessCode', '=', req.query.id).first();
		  
		  if (!found) {
			  res.send('Your access code is invalid. An administrator has been contacted.');
			  return;
		  }
		  
		  if (found.used) {
			  res.send('This access code is already in use. An administrator has been contacted.');
			  return;
		  }
			
		  found.used = true;
		  
		  next();
	});
	
	
	return true;
}