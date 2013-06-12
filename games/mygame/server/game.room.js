/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel) {

    node.debug = true;
    node.verbosity = 100;
    var stager = new node.Stager();

    // second parameter makes available to the required file its properties
    var clientGame = channel.require(__dirname + '/includes/game.client', {
        Stager: node.Stager,
        stepRules: node.stepRules
    });

 
    var times = 0;
    var waitingStage = {
        id: 'waiting',
        cb: function() {
	    times++;
	    console.log('I am executing waiting: ' + times);
            return true;
        }

    };

    stager.addStage(waitingStage);


    stager.setOnInit(function(){

        node.on.pconnect(function(p) {
            console.log('-----------Player connected ' + p.id);
	    debugger;
            // clientGame gets *fully* stringified with JSUS.stringifyAll
            node.remoteSetup('game', p.id, clientGame);
            node.remoteSetup('env', p.id, {
                ahah: true
            });
	    // resend the player list (it gets overridden by the game setup
	    node.socket.send(node.msg.create({
		target: 'PLIST',
		to: p.id,
		data: node.game.pl.db
	    }));
            node.remoteCommand('start', p.id);
        });
    });

    stager.setOnGameOver(function(){
	console.log('^^^^^^^^^^^^^^^^GAME OVER^^^^^^^^^^^^^^^^^^');
    });
    

    stager.init().next('waiting');


    var settings = {
        name: "wroom",
        stages: stager
    };

    return settings;

};
