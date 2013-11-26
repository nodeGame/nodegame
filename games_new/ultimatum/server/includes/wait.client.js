/**
 * # Antechamber for Ultimatum Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Displays a simple waiting page for clients about to start a game.
 *
 * ---
 */

var ngc = module.parent.exports.ngc;
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

var stager = new Stager();
var game = {};

module.exports = game;

// Functions

function waiting2start() {
    var span_connected, span_dots_container, span_msg;
    span_connected = document.getElementById('span_connected');
    span_dots_container = document.getElementById('span_dots_container');
    span_msg = document.getElementById('span_msg');
    
    // Add Loading dots...
    W.addLoadingDots(span_dots_container);

    function updateConnected(data) {
    	span_connected.innerHTML = data.nPlayers + ' / ' + data.poolSize;  
        if (data.retry) {
            span_msg.innerHTML = 'A batch of games has just started. ' +
                'Unfortunately, you have not been selected. Please, keep ' +
                'waiting, the next batch should start shortly.';
        }
    }

    node.on.data('waitingRoom', function(msg) {
        updateConnected(msg.data);
    });

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // node.getJSON is a utility which retrieves JSON data from the server at
    // the given URI or URIs (if an array of strings is given).
    //
    // The second parameter is called once for every URI with the data
    // retrieved.
    //
    // A third optional parameter is called after all the data has been
    // acquired.
    //
    /////////////////////////////////////////////
    node.getJSON(['/ultimatum/package.json'], function(data) {
        W.writeln('Game version: ' + data.version);
    }, function() {
        console.log('getJSON finished');
    } );
}

// Setting the game plot

stager.addStage({
    id: 'waiting2start',
    cb: waiting2start,
    steprule: stepRules.WAIT
});

stager.init()
    .next('waiting2start');


// Exporting the data.

game.plot = stager.getState();

game.metadata = {
    name: 'Waiting 2 Start - Client',
    description: 'Presents a simple interface while the client waits to start a game.',
    version: '0.1'
};
