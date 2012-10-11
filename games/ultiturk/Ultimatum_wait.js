//////////////////////////////////////////////
// nodeGame Ultimatum Game 
//
// Extensively documented tutorial for
// nodeGame beginners.
//
// http://www.nodegame.org
//
/////////////////////////////////////////////

function Ultimatum_wait () {
	
	this.name = 'Waiting Room Ultimatum Game - Client';
	this.description = 'Waits until the game starts....';
	this.version = '0.1';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = true;

//	this.minPlayers = 2;
//	this.maxPlayers = 10;
	
	this.init = function() {
		node.onDATA('FULL', function(msg){
			console.log('I have excluded');
			console.log(msg);
			W.getElementById('h2title').innerHTML = 'I am sorry but the game has already started, and for the moment you cannot join it. Please try again later.'
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