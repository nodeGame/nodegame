/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel) {

    var Database = require('nodegame-db').Database;
    var ngdb = new Database(node);
    var mdb = ngdb.getLayer('MongoDB');
   
    var stager = new node.Stager();

    // second parameter makes available to the required file its properties
    var client = channel.require(__dirname + '/includes/game.client', {
        Stager: node.Stager,
        stepRules: node.stepRules
    });

    // second parameter makes available to the required file its properties
    var logic = channel.require(__dirname + '/includes/game.logic', {
        Stager: node.Stager,
        stepRules: node.stepRules,
        mdb: mdb,
        node: node
    });

    var waitingStage = {
        id: 'waiting',
        cb: function() {
            return true;
        }
	
    };

    stager.addStage(waitingStage);

    stager.setOnInit(function() {

        node.on.pconnect(function(p) {
            var room;
            console.log('-----------Player connected ' + p.id);
	    // Setting metadata, settings, and plot
            node.remoteSetup('game_metadata',  p.id, client.metadata);
	    node.remoteSetup('game_settings', p.id, client.settings);
	    node.remoteSetup('plot', p.id, client.plot);
            
            // create the object
            room = channel.createGameRoom({
                players: new node.PlayerList(null, [p]),
                logic: logic 
            });
                   
            // not existing at the moment
            // the remoteCommand start on the client must be called
            // room.start(); // .exec();

            // or we can use the this:
            // node.remoteCommand('start', p.id);
            
        });
    });

    stager.setOnGameOver(function() {
	console.log('^^^^^^^^^^^^^^^^GAME OVER^^^^^^^^^^^^^^^^^^');
    });

    stager.init().loop('waiting');

    return {
	game_metadata: {
	    name: 'wroom',
	    version: '0.0.1'
	},
	game_settings: {
	    observer: false
	},
	plot: stager.getState(),
	debug: true,
	verbosity: 100
    };

};