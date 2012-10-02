function Ultimatum_wait () {
	
	this.name = 'Waiting Room Ultimatum Game - Client';
	this.description = 'Waits until the game starts....';
	this.version = '0.1';
	
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
		node.on('UPDATED_PLIST', function(){
			console.log('Player list = ' + node.game.pl.length);
			
			if (open && node.game.pl.length === NUMPLAYERS) {
				open = false; // only one set of players allowed now
				node.game.pl.each(function(p){
					var mtid = p.mtid;
					node.redirect('/ultimatum/index.html?id=' + mtid, p.id);
				});
				
			}
		});
		
		console.log('init!!!!');
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

// Starting the Game

var node = require('nodegame-client');
var JSUS = node.JSUS;

var conf = {
	name: "waiter",
	url: "http://localhost:8080/ultimatum/wait/admin",
	io: {
	    'reconnect': false,
	    'transports': ['xhr-polling'],
	    'polling duration': 10
	},
	verbosity: 0,
};

node.play(conf, new Ultimatum_wait());
