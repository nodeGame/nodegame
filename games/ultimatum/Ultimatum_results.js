//////////////////////////////////////////////
// nodeGame Ultimatum Game 
//
// Extensively documented tutorial for
// nodeGame beginners.
//
// http://www.nodegame.org
//
/////////////////////////////////////////////

function Ultimatum_results () {
	
	this.name = 'Ultimatum_results';
	this.description = 'Display results of ultimatum game in real time';
	this.version = '0.1';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = true;

//	this.minPlayers = 2;
//	this.maxPlayers = 10;
	
	this.init = function() {
		W.addWidget('D3ts', document.getElementById('root'));
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