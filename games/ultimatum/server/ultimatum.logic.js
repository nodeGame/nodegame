var node = module.parent.exports;

function Ultimatum () {

	this.name = 'Backend logic for Ultimatum Game';
	this.description = 'No Description';
	this.version = '0.2';
	
	this.minPlayers = 3;
	this.maxPlayers = 10;
	
	this.auto_step = true;
	
	this.init = function () {
		
		//node.events.remove('STATEDONE');
		
//		node.on('STATEDONE', function(){
//			console.log('ahah I should step!')
//		});
		
		this.SHOWUP = 500;
		
		node.onDATA('response', function(msg) {
			var response = msg.data;
			if (!response) return;
			if (response.response === 'ACCEPT') {
				var resWin, bidWin, p;
				
				resWin = parseInt(response.value);
				bidWin = 100 - resWin;
				
				// Respondent payoff
				p = node.game.pl.get(msg.from);
				p.win = (!p.win) ? resWin : p.win + resWin;
				node.log('Added to respondent ' + msg.from + ' ' + response.value + ' ECU');
				
				// Bidder payoff
				p = node.game.pl.get(response.from);
				p.win = (!p.win) ? bidWin : p.win + bidWin;
				node.log('Added to bidder ' + p.id + ' ' + p.win + ' ECU');
			}
		});
		
	};
	
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
	
		node.log('PAIRS');
		node.log(groups.length);
		
		var i;
		var g = null;
		for ( i = 0; i < groups.length; i++) {
			g = groups[i];
			if (g.length > 1) {
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
				
				node.log('SENT BIDDER AND RESPONDENT');
				node.log(bidder.id);
				node.log(respondent.id);
				
			}
			// Someone was not paired. Let him wait
			else {
				var solo = g.first();
				node.say('SOLO', 'SOLO', solo.id);
				node.log('SENT SOLO');
				node.log(solo.id);
				
			}	
		}
		
		console.log('Game');
	};
	
	var postgame = function () {
		console.log('Postgame');
	};
	
	var endgame = function () {
		node.game.memory.save('./results.nddb');	
		var that = this;
		var exitcode;
		node.game.pl.each(function(p) {
			node.say(p.win, 'WIN', p.id);
			p.win = (that.SHOWUP + (p.win || 0)) / 1000;
		});
		
	      
	    
	    console.log('FINAL PAYOFF PER PLAYER');
	    console.log('***********************');
	    console.log(node.game.pl.keep(['id', 'win']).fetch());
	    
	    console.log('***********************');
	      
	    	      
		console.log('Game ended');
		
		//node.replay();
	};
	
	
	
	// Creating the Game Loop	
	this.loop = {
			
			1: {
				// Depending on when we start the logic
				// we need to have 1 or 2 rounds here.
				// rounds: 2, 
				state:	pregame,
				name:	'Game will start soon'
			},
			
			2: {state: 	instructions,
				name: 	'Instructions'
			},
				
			3: {rounds:	3, 
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

module.exports = Ultimatum;
