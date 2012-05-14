function Ultimatum () {

	this.name = 'Backend logic for Ultimatum Game';
	this.description = 'No Description';
	this.version = '0.2';
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.automatic_step = true;
	
	this.init = function () {};
	
	var pregame = function () {
		console.log('Pregame');
	};
	
	var instructions = function () {
		console.log('Instructions');
	};
		
	var game = function () {
		var that = this;
		
		// Pairs all players
		var groups = this.pl.getGroupsSizeN(2);
	
		console.log(node.state());
		console.log('PAIRS');
		console.log(groups.length);
		
		var i;
		var g = null;
		for ( i = 0; i < groups.length; i++) {
			g = groups[i];
			if (g.size() > 1) {
				g.shuffle();
				// Bidder
				var bidder = g.first();
				var respondent = g.last();
				
				var data_b = {
						role: 'bidder',
						other: respondent.id
				};
				var data_r = {
						role: 'respondent',
						other: bidder.id
				};
				
				// Send a message to each player with their role
				// and the id of the player they play against
				node.say(data_b, 'BIDDER', bidder.id);
				node.say(data_r, 'RESPONDENT', respondent.id);
				
				console.log(node.state());
				console.log('SENT BIDDER AND RESPONDENT');
				console.log(bidder.id);
				console.log(respondent.id);
				
			}
			// Someone was not paired. Let him wait
			else {
				var solo = g.first();
				node.say('SOLO', 'SOLO', solo.id);
				console.log('SENT SOLO');
				console.log(solo.id);
				
			}	
		}
		
	//	setTimeout(function(){
	//		console.log(node.game.memory.fetch());
	//	}, 2000);
		
		console.log('Game');
	};
	
	var postgame = function () {
		console.log('Postgame');
	};
	
	var endgame = function () {
		node.memory.dump('./results.csv', true);		
		console.log('Game ended');
	};
	
	
	
	// Creating the Game Loop	
	this.loops = {
			
			1: {state:	pregame,
				name:	'Game will start soon'
			},
			
			2: {state: 	instructions,
				name: 	'Instructions'
			},
				
			3: {rounds:	10, 
				state: 	game,
				name: 	'Game'
			},
			
			4: {state:	postgame,
				name: 	'Questionnaire'
			},
				
			5: {state:	endgame,
				name: 	'Thank you'
			}
	};	

}


if ('object' === typeof module && 'function' === typeof require) {
	var node = require('../../../node_modules/nodegame-server/node_modules/nodegame-client');
	var JSUS = node.JSUS;
	
	module.exports.node = node;
	module.exports.Ultimatum = Ultimatum;
}

var conf = {
	name: "P_" + Math.floor(Math.random()*100),
	url: "http://localhost:8080/ultimatum/admin",
	io: {
	    'reconnect': false,
	    'transports': ['xhr-polling'],
	    'polling duration': 10
	}
	// verbosity: 10
};

node.play(conf, new Ultimatum());
