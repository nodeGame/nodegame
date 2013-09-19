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
    // by counter; also on.data(NEXT) a new set will be sent.
    var counter = 0;

    // Creating the Stager object to define the game.
    var stager = new node.Stager();

    // Loading the game to send to each connecting client.
    // Second parameter makes available to the required file its properties.
    var client = channel.require(__dirname + '/includes/game.client', {
        Stager: node.Stager,
        stepRules: node.stepRules
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
        
        // Sends the faces (reply to a GET request from client.
        node.on('NEXT', function(msg) {
            return sets[counter++];
        });

//        node.on.data('NEXT', function(msg) {
//            return sets[counter++];
//        });
        
        node.on.data('cat',function(msg) {
            console.log('**** Received a CAT! ***');
            console.log(msg.data);
//            if (!msg.from) {
//                // Log error.
//                msg.from = 'NA';
//            }
//            if (!msg.data) {
//                // Log error.
//                return;
//            }
//            if (!msg.data.round) {
//                // Log and continue
//                msg.data.round = 'NA';
//            }
//            if (!msg.data.session) {
//                // Log and continue
//                msg.data.session = 'NA';
//            }
//            if (!msg.data.player) {
//                // Log and continue
//                msg.data.player = 'NA';
//            }
//            if (!msg.data.cat) {
//                // Log and continue
//                msg.data.cat = 'NA';
//            }
//            if (!msg.data.tags) {
//                // Log and continue
//                msg.data.tags = ['NA'];
//            }
//            if (!msg.data.id) {
//                // Log and continue
//                msg.data.id = 'NA';
//            }
            
            console.log('Writing!!!');
            mdbWrite.store(msg.data);

        });

        node.on('sample', function(msg) {
            console.log('**** Received a get SAMPLE! ***');
            return sets[counter].items.concat(sets[(counter+1)].items);
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
