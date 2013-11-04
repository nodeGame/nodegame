/**
 * # Waiting Room for Ultimatum Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Handles incoming connections, matches them, sets the Ultimatum game
 * in each client, move them in a separate gaming room, and start the game.
 * ---
 */
module.exports = function(node, channel, room) {
    
    var dk = require('descil-mturk');
    var request = require('request');
    var stager = node.Stager;

    stager.setOnInit(function() {
	var that = this;
	
	this.waiting = new node.PlayerList();
	
	node.on.pconnect(function(msg) {
	    var mtid, errUri, code;
            
            // M-Turk id
            mtid = msg.data.mtid;
	    code = dk.codeExists(mtid);

	    if (!code) {
		errUri = '/ultimatum/unauth.html?id=' + mtid + '&err0=1';	
		node.redirect(errUri, msg.data.id);
		return;
	    }

	    if (code.usage) {
		console.log('Code ' +  mtid + ' already in use ' + code.usage + ' times.');
		errUri = '/ultiturk/unauthr.html?id=' + mtid + '&codeInUse=1';
		node.redirect(errUri, msg.data.id);
		dk.decrementUsage(mtid);
	    }
	    else {
		// PLAYER IS AUTHORIZED
		dk.incrementUsage(mtid);

                // Check him in.
		dk.checkIn(mtid, function() {
                    node.say('CHECKEDIN', msg.data.id);
                });
	    }	
	});
	
	node.on.pdisconnect(function(msg) {
	    var mtid;
	    
	    mtid = msg.data.mtid;
	    
            if (dk.codeExists(mtid || '')) {
	        dk.decrementUsage(mtid);
	        console.log('Code ' +  mtid + ' in use ' + dk.codeUsage(mtid) + ' times');
            }
            else {
                console.log('Received pdiconnect with no valid mtid: ' + mtid);
                return;
            }
	});
	
	// A new player has completed the test and is ready to play
	node.on.data('READY', function(msg) {
	    node.redirect('/ultimatum/index.html?&id=' + mtid, p.id);
	});
	
	
	// user was redirected to the error page
	node.on.data('errors', function(msg) {    
	    dk.dropOut(msg.data.player.accessCode);
	});
	
    
                         
    });

                  
    
    var game = {};
                     
    game.metadata = {
        name = 'Server antechamber for Ultimaum-AMT',
        description = 'Validates players entry codes with an internal database.',
        version = '0.1'
    };
    
    game.plot = stager.getState();
         
    // Load code database before continuing.
    dk.getCodes(function() {
        if (!dk.codes.size()) {
            throw new Errors('antechamber.turk: no codes found.');
        }
        return game;    
    });
};





