function Ultimatum_wait () {
	
	this.name = 'Waiting Room Ultimatum Game - Client';
	this.description = 'Waits until the game starts...';
	this.version = '0.2';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = false;

//	this.minPlayers = 2;
//	this.maxPlayers = 10;
	
	var NUMPLAYERS = 3;
	var open = true; // Sends or not players to the game
	
	this.init = function() {
		var open = true;
		node.on('PCONNECT', function(msg) {
			console.log('Player list = ' + node.game.pl.length);
			
			if (!open) {
				node.say(null, 'FULL', msg.data.id);
			}
			else if (node.game.pl.length === NUMPLAYERS) {
				open = false; // only one set of players allowed now
			
				node.game.pl.each(function(p) {
					node.redirect('/ultimatum/index.html', p.id);
				});
				
			}
		});
		
	};
		
	var waiting = function() {
		node.log('Waiting room loaded');
	};
	

	this.loops = {
		1: {state: waiting,
			name: 'Waiting Room'
		},
	};	
}

//// RUN

var node = require('nodegame-client'),
	NDDB = node.NDDB,
	JSUS = node.JSUS;

var conf = {
	player: {
		name: "waiter",
	},
	url: "http://localhost:8080/ultimatum/wait/admin",
	verbosity: 0,
};

node.play(conf, new Ultimatum_wait());




