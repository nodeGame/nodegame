/**
 * # Client code for Ultimatum Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 * Extensively documented tutorial.
 *
 * http://www.nodegame.org
 * ---
 */

// NOTICE: for now do not call node.done() immediately in the callback.

var settings = require('./game.shared');
var REPEAT = settings.REPEAT;

var ngc = module.parent.exports.ngc;
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

var stager = new Stager();
var game = {};

module.exports = game;

// GLOBALS

game.globals = {};

// INIT and GAMEOVER

stager.setOnInit(function() {
    var that = this;
    var waitingForPlayers;

    console.log('INIT PLAYER!');

    // Hide the waiting for other players message.
    waitingForPlayers = W.getElementById('waitingForPlayers');
    waitingForPlayers.innerHTML = '';
    waitingForPlayers.style.display = 'none';

    // Set up the main screen:
    // - visual timer widget,
    // - visual state widget,
    // - state display widget,
    // - iframe of play,
    // - player.css
    W.setupFrame('PLAYER');

    this.other = null;

    node.on('BID_DONE', function(offer, to) {
        // TODO: check this timer obj.
        node.game.timer.stop();
        W.getElementById('submitOffer').disabled = 'disabled';
        node.set('offer', offer);
        node.say('OFFER', to, offer);
        W.write(' Your offer: ' +  offer + '. Waiting for the respondent... ');
    });

    node.on('RESPONSE_DONE', function(response, offer, from) {
        console.log(response, offer, from);
        node.set('response', {
            response: response,
            value: offer,
            from: from
        });
        node.say(response, from, response);

        //////////////////////////////////////////////
        // nodeGame hint:
        //
        // node.done() communicates to the server that
        // the player has completed the current state.
        //
        // What happens next depends on the game.
        // In this game the player will have to wait
        // until all the other players are also "done".
        //
        // This command is a shorthand for:
        //
        // node.emit('DONE');
        //
        /////////////////////////////////////////////
        node.done();
    });

    this.randomAccept = function(offer, other) {
        var accepted = Math.round(Math.random());
        console.log('randomaccept');
        console.log(offer + ' ' + other);
        if (accepted) {
            node.emit('RESPONSE_DONE', 'ACCEPT', offer, other);
            W.write(' You accepted the offer.');
        }
        else {
            node.emit('RESPONSE_DONE', 'REJECT', offer, other);
            W.write(' You rejected the offer.');
        }
    };

    this.isValidBid = function(n) {
        if (!n) return false;
        n = parseInt(n, 10);
        return !isNaN(n) && isFinite(n) && n >= 0 && n <= 100;
    };

});

stager.setOnGameOver(function() {
    // Do something.
});

///// STAGES and STEPS

//////////////////////////////////////////////
// nodeGame hint:
//
// Pages can be preloaded with this method:
//
// W.preCache()
//
// It loads the content from the URIs given in an array parameter, and the next
// time W.loadFrame() is used with those pages, they can be loaded from memory.
//
// W.preCache calls the function given as the second parameter when it's done.
//
/////////////////////////////////////////////
function precache() {
    W.lockFrame('Loading...');
    W.preCache([
        '/ultimatum/html/instructions.html',
        '/ultimatum/html/quiz.html',
        //'/ultimatum/html/bidder.html',  // these two are cached by following
        //'/ultimatum/html/resp.html',    // loadFrame calls (for demonstration)
        '/ultimatum/html/postgame.html',
        '/ultimatum/html/ended.html'
    ], function() {
        // Pre-Caching done; proceed to the next stage.
        node.done();
    });
}

function instructions() {
    var that = this;

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // The W object takes care of all
    // visual operation of the game. E.g.,
    //
    // W.loadFrame()
    //
    // loads an HTML file into the game screen,
    // and the execute the callback function
    // passed as second parameter.
    //
    /////////////////////////////////////////////
    W.loadFrame('/ultimatum/html/instructions.html', function() {
	var b = W.getElementById('read');
	b.onclick = function() {
	    node.done();
	};

        ////////////////////////////////////////////////
        // nodeGame hint:
        //
        // node.env executes a function conditionally to
        // the environments defined in the configuration
        // options.
        //
        // If the 'auto' environment was set to TRUE,
        // then the function will be executed
        //
        ////////////////////////////////////////////////
        node.env('auto', function() {

            //////////////////////////////////////////////
            // nodeGame hint:
            //
            // Emit an event randomly in a time interval
            // from 0 to 2000 milliseconds
            //
            //////////////////////////////////////////////
            node.timer.randomEmit('DONE', 2000);
        });

    });
    console.log('Instructions');
}

function quiz() {
    var that = this;
    W.loadFrame('/ultimatum/html/quiz.html', function() {

    });
    console.log('Quiz');
}

function ultimatum() {

    node.game.timer.stop();

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // var that = this;
    //
    // /this/ is usually a reference to node.game
    //
    // However, unlike in many progamming languages,
    // in javascript the object /this/ assumes
    // different values depending on the scope
    // of the function where it is called.
    //
    /////////////////////////////////////////////
    var that = this;

    var b, options, other;

    // Load the ultimatum interface: waiting for the ROLE to be defined
    //W.loadFrame('/ultimatum/html/ultimatum.html', function() {

        // Load the BIDDER interface.
        node.on.data('BIDDER', function(msg) {
            console.log('RECEIVED BIDDER!');
            other = msg.data.other;
            node.set('ROLE', 'BIDDER');

            //////////////////////////////////////////////
            // nodeGame hint:
            //
            // W.loadFrame takes an optional third 'options' argument which can
            // be used to request caching of the displayed frames (see the end
            // of the following function call). The caching mode can be set with
            // two fields: 'loadMode' and 'storeMode'.
            //
            // 'loadMode' specifies whether the frame should be reloaded
            // regardless of caching (loadMode = 'reload') or whether the frame
            // should be looked up in the cache (loadMode = 'cache', default).
            // If the frame is not in the cache, it is always loaded from the
            // server.
            //
            // 'storeMode' says when, if at all, to store the loaded frame. By
            // default the cache isn't updated (storeMode = 'off'). The other
            // options are to cache the frame right after it has been loaded
            // (storeMode = 'onLoad') and to cache it when it is closed, that
            // is, when the frame is replaced by other contents (storeMode =
            // 'onClose'). This last mode preserves all the changes done while
            // the frame was open.
            //
            /////////////////////////////////////////////
            W.loadFrame('/ultimatum/html/bidder.html', function() {

                // Start the timer after an offer was received.
                options = {
                    milliseconds: 30000,
                    timeup: function() {
                        node.emit('BID_DONE', Math.floor(1 + Math.random()*100),
                                  other);
                    }
                };
                node.game.timer.restart(options);

                b = W.getElementById('submitOffer');

                node.env('auto', function() {

                    //////////////////////////////////////////////
                    // nodeGame hint:
                    //
                    // Execute a function randomly
                    // in a time interval between 0 and 1 second
                    //
                    //////////////////////////////////////////////
                    node.timer.randomExec(function() {
                        node.emit('BID_DONE', Math.floor(1+Math.random()*100),
                                  other);
                    }, 4000);
                });

                b.onclick = function() {
                    var offer = W.getElementById('offer');
                    if (!that.isValidBid(offer.value)) {
                        W.writeln('Please enter a number between 0 and 100');
                        return;
                    }
                    node.emit('BID_DONE', offer.value, other);
                };

                node.on.data('ACCEPT', function(msg) {
                    W.write(' Your offer was accepted.');
                    node.timer.randomEmit('DONE', 3000);
                });

                node.on.data('REJECT', function(msg) {
                    W.write(' Your offer was rejected.');
                    node.timer.randomEmit('DONE', 3000);
                });

            }, { cache: { loadMode: 'cache', storeMode: 'onStore' } });

        });

        // Load the respondent interface.
        node.on.data('RESPONDENT', function(msg) {
            console.log('RECEIVED RESPONDENT!');
            other = msg.data.other;
            node.set('ROLE', 'RESPONDENT');

            options = {
                milliseconds: 30000,
                timeup: function() {
                    that.randomAccept(msg.data, other);
                }
            };
            node.game.timer.init(options);
            node.game.timer.updateDisplay();

            W.loadFrame('/ultimatum/html/resp.html', function() {


                //////////////////////////////////////////////
                // nodeGame hint:
                //
                // nodeGame offers several types of event
                // listeners. They are all resemble the syntax
                //
                // node.on.<target>
                //
                // For example: node.on.data(), node.on.plist().
                //
                // The low level event listener is simply
                //
                // node.on
                //
                // For example, node.on('in.say.DATA', cb) can
                // listen to all incoming DATA messages.
                //
                /////////////////////////////////////////////
                node.on.data('OFFER', function(msg) {
                    var offered, accept, reject;

                    // Start the timer only after an offer is received.
                    node.game.timer.start();

                    offered = W.getElementById('offered');
                    W.write('You received an offer of ' + msg.data, offered);
                    offered.style.display = '';

                    accept = W.getElementById('accept');
                    reject = W.getElementById('reject');

                    node.env('auto', function() {
                        node.timer.randomExec(function() {
                            that.randomAccept(msg.data, other);
                        }, 3000);
                    });

                    accept.onclick = function() {
                        console.log('=========');
                        node.emit('RESPONSE_DONE', 'ACCEPT', msg.data, other);
                    };

                    reject.onclick = function() {
                        console.log('=========!');
                        node.emit('RESPONSE_DONE', 'REJECT', msg.data, other);
                    };
                });

            }, { cache: { loadMode: 'cache', storeMode: 'onLoad' } });

        });
    //});

    console.log('Ultimatum');
}

function postgame(){
    W.loadFrame('/ultimatum/html/postgame.html', function() {
	node.env('auto', function(){
	    node.timer.randomEmit('DONE');
	});
    });
    console.log('Postgame');
}

function endgame(){
    W.loadFrame('/ultimatum/html/ended.html', function() {
	node.on.data('WIN', function(msg) {
	    W.write('Your bonus in this game is: ' + msg.data || 0);
	});
    });

    console.log('Game ended');
}

function clearFrame() {
    node.emit('INPUT_DISABLE');
    return true;
}

function notEnoughPlayers() {
    console.log('Not enough players');
    node.game.pause();
    W.lockFrame('The other player disconnected. We are now waiting to see if ' +
                ' he or she reconnects. If not the game will be terminated.');
}

// Add all the stages into the stager.

//////////////////////////////////////////////
// nodeGame hint:
//
// A minimal stage must contain two properties:
//
// - id: a unique name for the stage
// - cb: a callback function to execute once
//     the stage is loaded.
//
// When adding a stage / step into the stager
// there are many additional options to
// configure it.
//
// Properties defined at higher levels are
// inherited by each nested step, that in turn
// can overwrite them.
//
// For example if a step is missing a property,
// it will be looked into the enclosing stage.
// If it is not defined in the stage,
// the value set with _setDefaultProperties()_
// will be used. If still not found, it will
// fallback to nodeGame defaults.
//
// The most important properties are used
// and explained below.
//
/////////////////////////////////////////////

// A step rule is a function deciding what to do when a player has
// terminated a step and entered the stage level _DONE_.
// Other stepRules are: SOLO, SYNC_STAGE, SYNC_STEP, OTHERS_SYNC_STEP.
// In this case the client will wait for command from the server.
stager.setDefaultStepRule(stepRules.WAIT);

stager.addStage({
    id: 'precache',
    cb: precache,
    // `minPlayers` triggers the execution of a callback in the case
    // the number of players (including this client) falls the below
    // the chosen threshold. Related: `maxPlayers`, and `exactPlayers`.
    minPlayers: [ 2, notEnoughPlayers ],
    syncOnLoaded: true,
    done: clearFrame
});

stager.addStage({
    id: 'instructions',
    cb: instructions,
    minPlayers: [ 2, notEnoughPlayers ],
    syncOnLoaded: true,
    timer: 600000,
    done: clearFrame
});

stager.addStage({
    id: 'quiz',
    cb: quiz,
    minPlayers: [ 2, notEnoughPlayers ],
    syncOnLoaded: true,
    // `timer` starts automatically the timer managed by the widget VisualTimer
    // if the widget is loaded. When the time is up it fires the DONE event.
    // It accepts as parameter:
    //  - a number (in milliseconds),
    //  - an object containing properties _milliseconds_, and _timeup_
    //     the latter being the name of the event to fire (default DONE)
    // - or a function returning the number of milliseconds.
    timer: 60000,
    done: clearFrame
});

stager.addStage({
    id: 'ultimatum',
    cb: ultimatum,
    minPlayers: [ 2, notEnoughPlayers ],
    // `syncOnLoaded` forces the clients to wait for all the others to be
    // fully loaded before releasing the control of the screen to the players.
    // This options introduces a little overhead in communications and delay
    // in the execution of a stage. It is probably not necessary in local
    // networks, and it is FALSE by default.
    syncOnLoaded: true,
    done: clearFrame
});

stager.addStage({
    id: 'endgame',
    cb: endgame,
    // `done` is a callback function that is executed as soon as a
    // _DONE_ event is emitted. It can perform clean-up operations (such
    // as disabling all the forms) and only if it returns true, the
    // client will enter the _DONE_ stage level, and the step rule
    // will be evaluated.
    done: clearFrame
});

stager.addStage({
    id: 'questionnaire',
    cb: postgame
});


// Now that all the stages have been added,
// we can build the game plot

stager.init()
    .next('precache')
    .next('instructions')
    .next('quiz')
    .repeat('ultimatum', REPEAT)
    .next('questionnaire')
    .next('endgame')
    .gameover();

// We serialize the game sequence before sending it.
game.plot = stager.getState();

// Let's add the metadata information.
game.metadata = {
    name: 'ultimatum',
    version: '0.0.1',
    session: 1,
    description: 'no descr'
};

// Other settings, optional.
game.settings = {
    publishLevel: 2
};
game.env = {
    auto: true
};
game.verbosity = 100;
