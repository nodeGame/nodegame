/**
 * This is a game that spawns sub-games 
 * 
 */
module.exports = function(node, channel) {


    node.verbosity = 100;
    var stager = new node.Stager();

    var clientGame = channel.require(__dirname + '/includes/game.client', {
	Stager: node.Stager
    });

    var waitingStage = {
        id: 'waiting',
        cb: function() {
            node.on.pconnect(function(p) {
                console.log('-----------Player connected ' + p.id);
                //debugger;
		
		// clientGame gets *fully* stringifies with JSUS.stringified
                node.remoteSetup('game', clientGame, p.id);
                node.remoteSetup('env', {
                    ahah: true
                }, p.id);
		node.remoteCommand('start', p.id);
            });
            return;
        }

    };
	
	stager.addStage(waitingStage);

	stager.init().next('waiting')

	
    var settings = {
        name: "wroom",
        stages: stager
    };
    	
	return settings;

};
