module.exports = configure;

var request = require('request'),
	NDDB = require('NDDB').NDDB;

// REMOVED FOR NOT - undocumented
//	var dk = require('descil-mturk');

function configure (app) {

	return true;
	
	// Comment to play with Mturk 
	// Notice: requires valid descil-mturk credentials!
	
	dk.getCodes(function(){
		//console.log(dk.codes.id);
	});
	
	var url = 'http://google.com';
	
	app.param('game', function(req, res, next, game) {
		  if (game !== 'ultiturk') {
			  next();
			  return;
		  }
		  if (req.params[0] !== 'room.html') {
			  //console.log('req0 ' + req.params[0]);
			  next();
			  return;
		  }
		  
		  if (!req.query || !req.query.id) {
			  //res.send('You cannot access this page without a valid access code. An administrator has been contacted.');
			  res.redirect('/ultiturk/error.html?err0=1');
			  return;
		  }
		  
		  var found = dk.codes.id[req.query.id];
		  
		  //var found =  dk.codes.select('AccessCode', '=', req.query.id).first();
		  
		  if (!found) {
			  //res.send('Your access code is invalid. An administrator has been contacted.');
			  res.redirect('/ultiturk/error.html?id=' + req.query.id + '&err0=1');
			  return;
		  }
		  
//		  if (found.used) {
//			  //res.send('This access code is already in use. An administrator has been contacted.');
//			  res.redirect('/ultiturk/error.html?id=' + req.query.id + '&codeInUse=1&http=1');
//			  return;
//		  }
			
		  found.used = true;
		  
		  next();
	});
	
	
	return true;
}