/**
 * # FACECAT
 *
 * This is the waiting room of a single player game.
 * Since it is single player, there is no need to create new sub rooms,
 * or nested groups.
 *
 */
module.exports = function(node, channel) {

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
    mdb.connect(function() {
        var db = mdb.getDbObj();
        var collection = db.collection('facerank_sets_ordered');
        collection.find().toArray(function(err, data) {
            console.log('data in facerank_col:', data[0]);
            console.log();
            sets = data;
            mdb.disconnect();
        });
    });
    
    // Open the collection where the categories will be stored.
    var mdbWrite = ngdb.getLayer('MongoDB', {
        dbName: 'facerank_db',
        collectionName: 'facecats'
    });


    // 2. Defining the single player game.

    // Every new connecting player will receive a new set of faces, indexed
    // by counter; also on.data(NEXT) a new set will be sent.
    var counter = 0;

    // Creating the Stager object to define the game.
    var stager = new ngc.Stager();

    // Loading the game to send to each connecting client.
    // Second parameter makes available to the required file its properties.
    var client = channel.require(__dirname + '/includes/game.client', {
        Stager: ngc.Stager,
        stepRules: ngc.stepRules
    });
    
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
            var room;
            console.log('** Player connected: ' + p.id + ' **');
	    // Setting metadata, settings, and plot
            node.remoteSetup('game_metadata',  p.id, client.metadata);
	    node.remoteSetup('game_settings', p.id, client.settings);
	    node.remoteSetup('plot', p.id, client.plot);
            
            // Setting up the global variables in the client, if necessary.
            // node.remoteSetup('env', ... );
            
            // Start the game on the client.
            node.remoteCommand('start', p.id);
        });

        node.on.data('NEXT', function(msg) {
            node.say('FACES', msg.from, sets[counter++]);
            // Send a series of faces
            // Saves who got which series
            
        });

        node.on.data('CAT', function(msg) {
            if (!msg.from) {
                // Log error.
                msg.from = 'NA';
            }
            if (!msg.data) {
                // Log error.
                return;
            }
            if (!msg.data.round) {
                // Log and continue
                msg.data.round = 'NA';
            }
            if (!msg.data.session) {
                // Log and continue
                msg.data.session = 'NA';
            }
            if (!msg.data.player) {
                // Log and continue
                msg.data.player = 'NA';
            }
            if (!msg.data.cat) {
                // Log and continue
                msg.data.cat = 'NA';
            }
            if (!msg.data.tags) {
                // Log and continue
                msg.data.tags = ['NA'];
            }
            if (!msg.data.id) {
                // Log and continue
                msg.data.id = 'NA';
            }
            
            mdbWrite.store({
                from: msg.from,
                round: msg.data.round,
                session: msg.data.sesion,
                player: msg.data.player,
                cat: msg.data.cat,
                tags: msg.data.tags,
                id: msg.data.id
            });
               
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
	verbosity: 1
    };

};
