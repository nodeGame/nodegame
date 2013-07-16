/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel) {

   
    var stager = new node.Stager();

    // second parameter makes available to the required file its properties
    var client = channel.require(__dirname + '/includes/game.client', {
        Stager: node.Stager,
        stepRules: node.stepRules
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
            console.log('-----------Player connected ' + p.id);
	    // Setting metadata, settings, and plot
            node.remoteSetup('game_metadata',  p.id, client.metadata);
	    node.remoteSetup('game_settings', p.id, client.settings);
	    node.remoteSetup('plot', p.id, client.plot);
            
            // Start the game if we have enough players
            var minp = node.game.plot.getGlobal(null, 'MINPLAYERS');
            if (node.game.pl.length > minp) {
                node.remoteCommand('start', 'ALL');
            }
        });
    });

    stager.setOnGameOver(function() {
	console.log('^^^^^^^^^^^^^^^^GAME OVER^^^^^^^^^^^^^^^^^^');
    });
    

    stager.setDefaultGlobals({
        MINPLAYERS: 3
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
