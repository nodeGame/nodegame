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
	
	this.init = function() {
		node.on('UPDATED_PLIST', function(){
			console.log('Player list = ' + node.game.pl.length);
			
			if (node.game.pl.length === 3) {
				node.redirect('/ultimatum/index.html', 'ALL');
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
	verbosity: 10,
};

node.play(conf, new Ultimatum_wait());