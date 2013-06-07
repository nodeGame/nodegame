/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel) {

    node.debug = true;
    node.verbosity = 100;
    var stager = new node.Stager();

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
	    
            // clientGame gets *fully* stringified with JSUS.stringified
            node.remoteSetup('game', clientGame, p.id);
            node.remoteSetup('env', {
                ahah: true
            }, p.id);
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
