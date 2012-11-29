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
	
	this.name = 'Waiting Room - Client';
	this.description = 'Tests if the browser has the necessary requirement, and then it waits until the game starts....';
	this.version = '0.3';
	
	this.auto_step = true; 
	this.auto_wait = false;
	this.solo_mode = true;

	this.minPlayers = 3;
	this.maxPlayers = 10;
	
	this.init = function() {
		var that = this;
		this.checkedIn = false;
		
		node.onDATA('CHECKEDIN', function(){
			that.checkedIn = true;
			node.emit('DONE');
		});
	};

	var checkingIn = function() {
		if (this.checkedIn){
			node.emit('DONE');
		}
		
		
	};

	var testing = function() {
		node.window.loadFrame('/ultiturk/html/room/testing.html', function(){
			//
		});
		node.log('Test page loaded');
	};
	
	
	var waiting = function() {
		node.window.loadFrame('/ultiturk/html/room/waiting.html', function() {
			// 
		});
		node.log('Waiting room loaded');
	};
	

	this.loop = {
		1: {state: checkingIn,
			name: 'Test page',
		},	
			
		2: {state: testing,
			name: 'Test page',
		},
		
		3: {state: waiting,
			name: 'Waiting Room',
		},
	};	
}