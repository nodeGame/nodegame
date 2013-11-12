/**
 * # Requierements Room for Ultimatum Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Handles incoming connections, validates authorization tokens
 * check browser requirements, and collect feedbacks.
 * ---
 */
module.exports = function(node, channel, room) {

    var path = require('path');
    
    // Reads in descil-mturk configuration.
    var confPath = path.resolve(__dirname, 'descil.conf.js');
    console.log(confPath);
    var dk = require('descil-mturk')(confPath);

    // Creates a stager object to define the game stages.
    var stager = new node.Stager();

    // Functions

    function init() {
        var that = this;

        // Load code database
        dk.getCodes(function() {
            if (!dk.codes.size()) {
                throw new Errors('requirements.room: no codes found.');
            }
        });
	
	node.on.pconnect(function(player) {
            node.remoteCommand('start', player.id);
	});

        node.on('MTID', function(msg) {
            var mtid, errUri, code;
            
            console.log('MTID');
            
            // M-Turk id
            mtid = msg.data;
	    
            if ('string' !== typeof mtid) {
                return {
                    success: false,
                    msg: 'Malformed or empty code received.'
                };
            }
            
            code = dk.codeExists(mtid);
            
	    if (!code) {
		// errUri = '/ultimatum/unauth.html?id=' + mtid + '&err0=1';	
		// node.redirect(errUri, msg.data.id);
		return {
                    success: false,
                    msg: 'Code not found: ' + mtid
	        };
            }

	    if (code.usage) {
		//console.log('Code ' +  mtid + ' already in use ' + code.usage + ' times.');
		// errUri = '/ultiturk/unauthr.html?id=' + mtid + '&codeInUse=1';
		// node.redirect(errUri, msg.data.id);
		// dk.decrementUsage(mtid);
                return {
                    success: false,
                    msg: 'Code already in use: ' + mtid
	        };
	    }
	    
            return {
                success: true,
                msg: 'Code validated.'
            };
        });


        node.on.pdisconnect(function(player) {
	    var mtid = player.mti;
	    
            if (!mtid) {
                return;
            }
	    
         // if (dk.codeExists(mtid || '')) {
	 //     dk.decrementUsage(mtid);
	 //     console.log('Code ' +  mtid + ' in use ' + dk.codeUsage(mtid) + ' times');
         // }
         // else {
         //     console.log('Received pdiconnect with no valid mtid: ' + mtid);
         //     return;
         // }
	});
	
	// User was redirected to the error page.
	node.on.data('errors', function(msg) {
            console.log('errors');
            console.log(msg.data);
	    // dk.dropOut(msg.data.player.accessCode);
	});

        // In case a user is using the feedback form display the action.
        node.on.data('FEEDBACK', function(msg) {
            console.log('Feedback received.');
            console.log(msg.data);
        });
    }

    // Define stager.

    stager.setOnInit(init);

    // A unique game stage that will handle all incoming connections. 
    stager.addStage({
        id: 'requirements',
        cb: function() {
            // Returning true in a stage callback means execution ok.
            return true;
        }
    });

    stager
        .init()
        .loop('requirements');
    

    
    // Return the game.
    game = {};
    
    game.metadata = {
        name: 'Requirements check room for Ultimaum-AMT',
        description: 'Validates players entry codes with an internal database.',
        version: '0.1'
    };
    
    // Throws errors if true.
    game.debug = true;

    game.plot = stager.getState();

    return game;
};






