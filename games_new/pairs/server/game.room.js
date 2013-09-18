/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel) {

    var Database = require('nodegame-db').Database;
    var ngdb = new Database(node);
    var mdb = ngdb.getLayer('MongoDB');
   
    var stager = new node.Stager();
    var logicPath = __dirname + '/includes/game.logic';

    var ngc = require('nodegame-client');

    // second parameter makes available to the required file its properties
    var client = channel.require(__dirname + '/includes/game.client', {
        ngc: ngc
    });

    var waitingStage = {
        id: 'waiting',
        cb: function() {
            return true;
        }
	
    };

    stager.addStage(waitingStage);

    stager.setOnInit(function() {
        var counter = 0;

        console.log('********Initializing Game Room*****************');

        node.on.pconnect(function(p) {
            var room, wRoom;

            console.log('-----------Player connected ' + p.id);

            wRoom = channel.waitingRoom.clients.player;
            if (wRoom.size() < 2) return;

            console.log('-----------We have two players');

            var tmpPlayerList = wRoom.shuffle().limit(2);
            
            room = channel.createGameRoom({
                group: 'pairs',
                clients: tmpPlayerList,
                channel: channel,
                logicPath: logicPath
            });
            
	    // Setting metadata, settings, and plot
            tmpPlayerList.each(function (p) {
                node.remoteSetup('game_metadata',  p.id, client.metadata);
                node.remoteSetup('game_settings', p.id, client.settings);
                node.remoteSetup('plot', p.id, client.plot);
                node.remoteSetup('env', p.id, client.env);

                node.remoteCommand('start', p.id);
            });
            
            room.startGame();
            
            // Send room number to admin
            channel.admin.socket.send2roomAdmins(node.msg.create({
                target: node.constants.target.TXT,
                text: 'ROOMNO',
                data: {
                    roomNo: counter,
                    pids: room.clients.player.id.getAllKeys(),
                    aids: room.clients.admin.id.getAllKeys()
                }
            }), room);
            counter ++;
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
	    version: '0.0.1'
	},
	game_settings: {
	    publishLevel: 0
	},
	plot: stager.getState(),
	debug: true,
	verbosity: 0
    };

};
