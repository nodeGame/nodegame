/**
 * # Requierements Room for Face Categorization Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Handles incoming connections, validates authorization tokens
 * check browser requirements, and collect feedbacks.
 * ---
 */
module.exports = function(node, channel, room) {

    var path = require('path');
    
    // Load shared settings.
    var settings = require(__dirname + '/includes/game.settings.js');

    // Reads in descil-mturk configuration.
    var confPath = path.resolve(__dirname, 'descil.conf.js');
    var dk = require('descil-mturk')(confPath);
    function codesNotFound() {
        var nCodes = dk.codes.size();
        console.log('Codes found: ', nCodes);
        if (!nCodes) {
            throw new Error('requirements.room: no codes found.');
        }
        // Add a ref to the node obj.
        node.dk = dk;
    }

    if (settings.AUTH === 'MTURK') {
        dk.getCodes(codesNotFound);
    }
    else {
        dk.readCodes(codesNotFound);
    }


    // Creates a stager object to define the game stages.
    var stager = new node.Stager();

    // Functions

    function init() {
        var that = this;

        console.log('********Requirements Room Created*****************');

	node.on.preconnect(function(player) {
            console.log('Player connected to Requirements room.');
            node.game.pl.add(player);
            node.remoteCommand('start', player.id);
	});

	node.on.pconnect(function(player) {
            console.log('Player connected to Requirements room.');
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
                msg: 'Code validated.',
                gameLink: '/facecat/'
            };
        });


        node.on.pdisconnect(function(player) {
            
	});
	
        // Results of the requirements check.
	node.on.data('requirements', function(msg) {
            console.log('requirements');
            console.log(msg.data);
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
    game.debug = settings.DEBUG;

    game.plot = stager.getState();

    game.nodename = 'rq';

    return game;
};






