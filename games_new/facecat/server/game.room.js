/**
 * # Waiting Room for Face categorization Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Handles incoming connections, sets the Face Categorization game
 * in each client, and start the game.
 * The state of each player is saved, and in case of disconnections and
 * reconnections the player restart from where it has left.
 * ---
 */
module.exports = function(node, channel) {

    var path = require('path');
    var J = require('JSUS').JSUS;

    // If NO authorization is found, local codes will be used,
    // and assigned automatically.
    var noAuthCounter = -1;

    // Still dispatching.
    var roomClosed = false;

    // Load shared settings.
    var settings = require(__dirname + '/includes/game.settings.js');

    // Reads in descil-mturk configuration.
    var confPath = path.resolve(__dirname, 'descil.conf.js');
    var dk = require('descil-mturk')(confPath);
    function codesNotFound() {
        var nCodes = dk.codes.size();
        console.log('Codes found: ', nCodes);
        if (!nCodes) {
            throw new Error('game.room: no codes found.');
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

    // 1. Setting up database connection.

    // Establish the connection to database to load face sets.
    var Database = require('nodegame-db').Database;
    var ngdb = new Database(node);
    var mdbLoad = ngdb.getLayer('MongoDB', {
        dbName: 'facerank_db',
        collectionName: 'facerank_sets_ordered'
    });

    // Loads the sets of faces to send to players.
    var sets;
    mdbLoad.connect(function() {
        var db = mdbLoad.getDbObj();
        var collection = db.collection('facerank_sets_ordered');
        collection.find().toArray(function(err, data) {
            console.log('data in facerank_col:', data[0]);
            console.log();
            sets = data;
            mdbLoad.disconnect();
        });
    });

    // Open the collection where the categories will be stored.
    var mdbWrite = ngdb.getLayer('MongoDB', {
        dbName: 'facerank_db',
        collectionName: 'facecats'
    });

    // Opening the database for writing.
    mdbWrite.connect(function(){});

    // 2. Defining the single player game.

    // Every new connecting player will receive a new set of faces, indexed
    // by counter; also on(NEXT) a new set will be sent.
    var counter = 0;

    // Creating the Stager object to define the game.
    var stager = new node.Stager();

    // Loading the game to send to each connecting client.
    // Second parameter makes available to the required file its properties.
    var client = channel.require(__dirname + '/includes/game.client', {
        Stager: node.Stager,
        stepRules: node.stepRules
    });

    var gameState = {};

    // Functions.

    // Creating an authorization function for the players.
    // This is executed before the client the PCONNECT listener.
    // Here direct messages to the client can be sent only using
    // his socketId property, since no clientId has been created yet.
    channel.player.authorization(function(header, cookies, room) {
        var code, player, token;

        if (settings.AUTH === 'NO') {
            return true;
        }

        playerId = cookies.player;
        token = cookies.token;

        console.log('game.room: checking auth.');

        // Weird thing.
        if ('string' !== typeof playerId) {
            console.log('no player: ', player)
            return false;
        }

        // Weird thing.
        if ('string' !== typeof token) {
            console.log('no token: ', token)
            return false;
        }

        code = dk.codeExists(token);

        // Code not existing.
	if (!code) {
            console.log('not existing token: ', token);
            return false;
        }

        // Code in use.
	if (code.usage) {
            if (code.disconnected) {
                return true;
            }
            else {
                console.log('token already in use: ', token);
                return false;
            }
	}

        // Client Authorized.
        return true;
    });

    // Assigns Player Ids based on cookie token.
    channel.player.clientIdGenerator(function(headers, cookies, validCookie,
                                              ids, info) {
        var code;
        if (settings.AUTH === 'NO') {
            code = dk.codes.db[++noAuthCounter].AccessCode;
            return code;
        }

        // Return the id only if token was validated.
        // More checks could be done here to ensure that token is unique in ids.
        if (cookies.token && validCookie) {
            return cookies.token;
        }
    });

    // Init Function. Will spawn everything.
    function init() {

        console.log('** Waiting Room: Initing... **');

        function connectingPlayer(p) {
            console.log('** Player connected: ' + p.id + ' **');

            // Increment Code.
            dk.incrementUsage(p.id);

            // Creating a state for reconnections.
            if (!gameState[p.id]) {
                gameState[p.id] = {
                    // The set of pictures to evaluate.
                    setId: null,
                    // The length of the set (needed to know when to send
                    // a new one).
                    setLength: null,
                    // Current picture of the set being categorized.
                    pic: 0,
                    // Flag: is player reconnecting.
                    resume: false,
                    // Counter: how many sets already completed.
                    completedSets: 0,
                    // User has just finished a set and will need a new one
                    newSetNeeded: true
                };
            }

	    // Setting metadata, settings, and plot
            node.remoteSetup('game_metadata',  p.id, client.metadata);
	    node.remoteSetup('game_settings', p.id, client.settings);
	    node.remoteSetup('plot', p.id, client.plot);

            // Setting up the global variables in the client, if necessary.
            // node.remoteSetup('env', ... );

            // Start the game on the client.
            node.remoteCommand('start', p.id);
        }


        node.on.pconnect(connectingPlayer);

        node.on.pdisconnect(function(p) {
            gameState[p.id].disconnected = true;
            gameState[p.id].stage = p.stage;
            // Free up code.
            dk.decrementUsage(p.id);
        });

        // This must be done manually for now (maybe change).
        node.on.mreconnect(function(p) {
            node.game.ml.add(p);
        });

        node.on.preconnect(function(p) {
            var p;
            debugger

            pState = gameState[p.id];
            if (!p) {
                return;
            }
            if (!pState.disconnected) {
                // error
            }
            pState.disconnected = false;
            // Player will continue from where he has left.
            gameState[p.id].resume = true;

            console.log('RESUME TRUE');

            // It is not added automatically.
            // TODO: add it automatically if we return TRUE? It must be done
            // both in the alias and the real event handler
            node.game.pl.add(p);

            connectingPlayer(p);
        });

        // Sends the faces (reply to a GET request from client).
        node.on('NEXT', function(msg) {
            var set, state, secondSet;
            console.log('***** Received NEXT ******');
            debugger
            state = gameState[msg.from];

            console.log(state);

            if (state.newSetNeeded) {
                state.setId = ++counter;
                state.newSetNeeded = false;
                state.pic = 0;
            }

            // We need to clone it, otherwise it gets overwritten.
            set = J.clone(sets[state.setId]);

            // This is a reconnection.
            if (state.resume) {
                console.log('WTF');
                node.remoteAlert('A previous unfinished game session has ' +
                                 'been detected. You will continue from ' +
                                 'the last image you saw.', msg.from);
                state.resume = false;


                // We slice to the last picture that has an evaluation
                // Since pictures are 1-based, we do not need to do -1.
                set.items = set.items.slice(state.pic);
            }
            else if (state.completedSets) {
                
                // Player has rated 2 sets (about 60 paitings).
                node.remoteCommand('step', msg.from);
                return;
            }

            // Update setLength in global state.
            state.setLength = set.items.length;

            console.log('COUNTER ', counter);
            console.log('SET LENGTH ', set ? set.items.length : 'no set');

            return set;
        });

        // Client is requesting a random sample.
        node.on('sample', function(msg) {
            console.log('**** Received a get SAMPLE! ***');
            return sets[counter].items.concat(sets[(counter+1)].items);
        });

        // Client has categorized an image.
        node.on.data('cat',function(msg) {
            var state;
            if (!msg.data) return;
            console.log('**** Received a CAT! ' + msg.data.round + '***');
            
            state = gameState[msg.from];
            console.log(state)
            // Update the counter of the last categorized pic.
            state.pic = msg.data.round;
            if (state.pic === state.setLength) {
                ++state.completedSets;
                state.newSetNeeded = true;
            }
            mdbWrite.store(msg.data);
        });

    }

    stager.setOnInit(init);

    // Create one waiting stage where everything will happen.
    stager.addStage({
        id: 'waiting',
        cb: function() {
            console.log('** Waiting Room: Opened! **');
            return true;
        }
    });

    stager.setOnGameOver(function() {
	console.log('^^^^^^^^^^^^^^^^GAME OVER^^^^^^^^^^^^^^^^^^');
    });

    stager.init().loop('waiting');

    return {
        nodename: 'wroom',
	game_metadata: {
	    name: 'wroom',
	    version: '0.1.0'
	},
	game_settings: {
	    publishLevel: 0,
	},
	plot: stager.getState(),
	verbosity: 1,
        debug: true
    };

};
