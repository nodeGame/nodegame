/**
 * # Waiting Room for Face categorization Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Handles incoming connections, sets the Face Categorization game
 * in each client, and start the game.
 * The state of each player is saved, and in case of disconnections and
 * reconnections the player restart from where it has left.
 * ---
 */
module.exports = function(node, channel) {

    var J = require('JSUS').JSUS;

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
        
    // Create one waiting stage where everything will happen.
    stager.addStage({
        id: 'waiting',
        cb: function() { 
            console.log('** Waiting Room: Opened! **');
            return true;
        }
    });

    stager.setOnInit(function() {

        console.log('** Waiting Room: Initing... **');

        node.on.pconnect(function(p) {
            console.log('** Player connected: ' + p.id + ' **');

            // Creating a state for reconnections.
            gameState[p.id] = {
                set: counter++,
                pic: 0
            };

	    // Setting metadata, settings, and plot
            node.remoteSetup('game_metadata',  p.id, client.metadata);
	    node.remoteSetup('game_settings', p.id, client.settings);
	    node.remoteSetup('plot', p.id, client.plot);
            
            // Setting up the global variables in the client, if necessary.
            // node.remoteSetup('env', ... );
            
            // Start the game on the client.
            node.remoteCommand('start', p.id);
        });

        node.on.pdisconnect(function(p) {   
            gameState[p.id].disconnected = true;
            gameState[p.id].stage = p.stage;
        });

        // This must be done manually for now (maybe change).
        node.on.mreconnect(function(p) {
            debugger
            node.game.ml.add(p);
        });

        node.on.preconnect(function(p) {
            var p;
            pState = gameState[p.id];
            if (!p) {
                // node.redirect();
                return;
            }
            if (!pState.disconnected) {
                // error
            }
            pState.disconnected = false;

            // It is not added automatically.
            // TODO: add it automatically if we return TRUE? It must be done
            // both in the alias and the real event handler
            node.game.pl.add(p);

            // We could slice the game plot, and send just what we need
            // however here we resend all the stages, and within the 'facecat'
            // stage we send just some of the faces
            console.log('** Player connected: ' + p.id + ' **');
	    // Setting metadata, settings, and plot.
            node.remoteSetup('game_metadata',  p.id, client.metadata);
	    node.remoteSetup('game_settings', p.id, client.settings);
	    node.remoteSetup('plot', p.id, client.plot);

            // Start the game on the client.
            node.remoteCommand('start', p.id);
        });
        
        // Sends the faces (reply to a GET request from client).
        node.on('NEXT', function(msg) {
            var set, state;
            state = gameState[msg.from];
            
            // This is a reconnection.
            if (state.pic !== 0) {
                node.remoteAlert('A previous unfinished game session has ' +
                                 'been detected. You will continue from ' +
                                 'the last image you saw.', msg.from);
            }

            // Set is finished.
            if (state.pic === 30) {
                if (!state.completedSets) { 
                    // Update to the next available counter level.
                    state.set = ++counter;
                    state.completedSets = 1;
                }
                else {
                    // Player has rated 60 paintings.
                    node.remoteCommand('step', msg.from);
                    return;
                }
            }

            // We need to clone it, otherwise it gets overwritten.
            set = J.clone(sets[state.set-1]);
            
            if (state.pic > 0) {    
                // We slice to the last picture that has an evaluation
                // Since pictures are 1-based, we do not need to do -1.
                set.items = set.items.slice(state.pic);
            }
            return set;
        });

        // Client is requesting a random sample.
        node.on('sample', function(msg) {
            console.log('**** Received a get SAMPLE! ***');
            return sets[counter].items.concat(sets[(counter+1)].items);
        });

        // Client has categorized an image.
        node.on.data('cat',function(msg) {
            if (!msg.data) return;
            console.log('**** Received a CAT! ' + msg.data.round + '***');
            // Update the counter of the last categorized pic.
            gameState[msg.from].pic = msg.data.round;
            mdbWrite.store(msg.data);

        });

    });

    stager.setOnGameOver(function() {
	console.log('^^^^^^^^^^^^^^^^GAME OVER^^^^^^^^^^^^^^^^^^');
    });

    stager.init().loop('waiting');

    return {
        nodename: 'wroom',
	game_metadata: {
	    name: 'wroom',
	    version: '0.0.2'
	},
	game_settings: {
	    publishLevel: 0,
	},
	plot: stager.getState(),
	verbosity: 1,
        debug: true
    };

};
