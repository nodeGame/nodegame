/**
 * #  nodeGame ServerNode
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 * 
 * Creates an HTTP server, and loads a Socket.io instance 
 * 
 * ---
 * 
 */

// ## Global scope



module.exports = configure;

var util = require('util'),
    fs = require('fs'),
    path = require('path'),
    express = require('nodegame-server').express,
    J = require('nodegame-client').JSUS;


/**
 * ### ServerNode._configureHTTP
 * 
 * Defines standard routes for the HTTP server
 * 
 * @param {object} options The object containing the custom settings
 */
function configure (app, servernode) {
	
	var rootDir = servernode.rootDir;
	
	app.configure(function(){
	    app.set('views', rootDir + '/views');
	    app.set('view engine', 'jade');
	    app.use(express.static(rootDir + '/public'));
	});

	app.configure('development', function(){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	app.configure('production', function(){
	  app.use(express.errorHandler());
	});

    app.get('/', function(req, res) {
    	console.log(req.query);
    	if (J.isEmpty(req.query)) {
    		res.render('index', {
                title: 'Yay! Your nodeGame server is running.'
            });
    	}
        
    	if (!req.query.q) {
    		res.send('Query must start with q=XXX');
    	}
    	var q = req.query.q;
    	
    	if (q === "info") {
    		//console.log(servernode.info);
    		res.send(servernode.info);
    	}
    	
    	if (q === "channels") {
    		//console.log(servernode.info);
    		res.send(servernode.info.channels);
    	}
    	
    	if (q === "games") {
    		//console.log(servernode.info);
    		res.send(servernode.info.games);
    	}
    	
    	res.send('Unknown query received.');
    });
    
    app.get('/error/:type', function(req, res) {
    	var type = req.params.type 
    	res.render('error/' + type);
    });
    
    app.get('/:game/*', function(req, res){    
	
    	var gameInfo = servernode.info.games[req.params.game];
    	
    	if (!gameInfo) {
    		res.send('Resource ' + req.params.game + ' is not available.');
    		return;
    	}
    	
    	if (req.params[0].match(/server\//)){
    		res.json({error: 'access denied'}, 403);
    		return;
    	} 
    	
    	var path = gameInfo.dir + '/' + req.params[0]; 
    	res.sendfile(path);
		
    });    
    
    return true;
};
