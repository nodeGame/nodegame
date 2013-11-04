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
    var span_connected, span_dots, span_msg;
    span_connected = document.getElementById('span_connected');
    span_dots = document.getElementById('span_dots');
    span_msg = document.getElementById('span_msg');
    
    // Refreshing the dots...
    setInterval(function() {
        if (span_dots.innerHTML !== '......') {
            span_dots.innerHTML = span_dots.innerHTML + '.';  
        }
        else {
            span_dots.innerHTML = '..';
        }
    }, 1000);

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
