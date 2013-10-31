/**
 * # Logic code for Ultimatum Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 * Extensively documented tutorial.
 *
 * http://www.nodegame.org
 * ---
 */

var channel = module.parent.exports.channel;
var node = module.parent.exports.node;
var Database = require('nodegame-db').Database;
var ngdb = new Database(node);
var mdb = ngdb.getLayer('MongoDB');


var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var GameStage = ngc.GameStage;
var J = ngc.JSUS;

var stager = new Stager();

// Variable registered outside of the export function are shared among all
// instances of game logics.
var counter = 0;
var MIN_PLAYERS = 2;
var PLAYING_STAGE = 2;

// Here we export the logic function. Must accept two parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which the this logic will be running.
module.exports = function(node, channel) {
 
    function doMatch() {
        var g, bidder, respondent, data_b, data_r;
        
        g = node.game.pl.shuffle();
        bidder = g.first();
        respondent = g.last();
        
        data_b = {
	    role: 'bidder',
	    other: respondent.id
        };
        data_r = {
	    role: 'respondent',
	    other: bidder.id
        };
        // Send a message to each player with their role
        // and the id of the other player.
        node.say('BIDDER', bidder.id, data_b);
        node.say('RESPONDENT', respondent.id, data_r);
        console.log('Matching completed.');
    }


    // Event handler registered in the init function are always valid.
    stager.setOnInit(function() {
        console.log('********************** ultimatum room ' + counter++ + ' **********************');

        var disconnected, matchingSteps;
        disconnected = {};
        
        // matchingSteps = ['1.1.1', '2.1.1', '2.1.2'];

        // Matching, and stepping can be done in different ways. It can be 
        // centralized, and the logic tells the clients when to step, or
        // clients can synchronize themselves and step automatically.
        
        // In this game, the clients are stepping automatically, according
        // to the rules defined in `game.client`. Here we want to follow
        // their updates, and executes the matching callbeck each time
        // enter a new gaming stage
//       node.on.stepdone(function(plist) {
//           var stageStr;
//           stage = new GameStage(plist.first().stage).toString();
//           if (J.inArray(stage, matchingSteps)) {
//               doMatch();
//           }
//       });

        // Reconnections must be handled by the game developer.
        node.on.preconnect(function(p) {
            console.log('Oh...somebody reconnected!', p);
            if (disconnected[p.id]) {
                // Notify other player he is back.
                node.socket.send(node.msg.create({
                    target: 'PCONNECT',
                    data: p,
                    to: 'ALL'
                }));

                delete disconnected[p.id];
            }
            else {
                // Player was not authorized, redirect to a warning page.
                node.redirect('/ultimatum/unauth.htm', p.id);
            }
            
        });

        // Register player disconnection, and wait for him...
        node.on.pdisconnect(function(p) {
            disconnected[p.id] = {
                id: p.id,
                stage: p.stage
            }
            // Wait for the player to reconnect, and after enough time
            // cancel the game.
        });

        console.log('init');
    });
    
    // Functions
    
    function instructions() {
        console.log('Instructions');
        // Start the game in all clients.
        node.game.pl.each(function (p) {
            node.remoteCommand('start', p.id);
        });
    }

    function ultimatum() {
        console.log('Ultimatum');
        node.game.pl.each(function(p) {
            node.remoteCommand('step', p.id);
        });
        doMatch();
    }
    
    function questionnaire() {
        console.log('questionnaire');
        node.game.pl.each(function(p) {
            node.remoteCommand('step', p.id);
        });
    }
    
    function endgame() {
        console.log('endgame');
        node.game.pl.each(function(p) {
            node.remoteCommand('step', p.id);
        });
    } 
    
    // Adding the stage.
    stager.addStage({
        id: 'instructions',
        cb: instructions,
        steprule: stepRules.OTHERS_SYNC_STEP,
        //syncOnLoaded: true,
        //timer: 600000
    });

    stager.addStage({
        id: 'ultimatum',
        cb: ultimatum,
        steprule: stepRules.OTHERS_SYNC_STEP,
        //syncOnLoaded: true,
    });

    stager.addStage({
        id: 'questionnaire',
        cb: questionnaire,
        steprule: stepRules.OTHERS_SYNC_STEP
    });
    
    stager.addStage({
        id: 'endgame',
        cb: endgame,
        steprule: stepRules.OTHERS_SYNC_STEP
    });

    // Building the game plot.
    var REPEAT = 3;

    stager
        .init()
        .next('instructions')
        .repeat('ultimatum', REPEAT)
        .next('questionnaire')
        .next('endgame')
        .gameover();

    return {
        nodename: 'lgc' + counter,
        game_metadata: {
            name: 'ultimatum',
            version: '0.0.1'
        },
        game_settings: {
            publishLevel: 0
        },
        plot: stager.getState(),
        debug: true,
        verbosity: 0
    };

};
