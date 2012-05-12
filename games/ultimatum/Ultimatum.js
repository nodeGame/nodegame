//////////////////////////////////////////////
// nodeGame Ultimatum Game 
//
// Extensively documented tutorial for
// nodeGame beginners.
//
// http://www.nodegame.org
//
/////////////////////////////////////////////

function Ultimatum () {
	
	this.name = 'Ultimatum Game';
	this.description = 'Two players split the pot. The receiver of the offer can accept or reject.';
	this.version = '0.3';
	
	// Wait for a STATE message from the server
	// to go to next state
	this.auto_step = false; 
	this.auto_wait = true;

	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	//////////////////////////////////////////////
	// nodeGame hint:
	//
	// The init function is the place to defined
	// global variables, and to setup the game
	// Event listeners defined here are valid 
	// for the whole game.
	//
	/////////////////////////////////////////////
	this.init = function() {
		this.BIDDER = 1;
		this.RESPONDENT = 0;	
		node.window.setup('PLAYER');
	};

	//////////////////////////////////////////////
	// nodeGame hint:
	//
	// The first function that is run by nodegame
	// defines what the player will see *before*
	// the game actually starts, i.e. when the 
	// all the players are connected.
	//
	/////////////////////////////////////////////
	var pregame = function() {
		node.window.loadFrame('html/pregame.html');
		console.log('Pregame');
	};
	

	var instructions = function(){	
		var that = this;
		
		//////////////////////////////////////////////
		// nodeGame hint:
		//
		// The node.window object takes care of all 
		// visual operation of the game. E.g.,
		//
		// node.window.loadFrame()
		//
		// loads an HTML file into the game screen, 
		// and the execute the callback function 
		// passed as second parameter.
		//
		/////////////////////////////////////////////
		node.window.loadFrame('html/instructions.html', function() {
			var b = node.window.getElementById('read');
			b.onclick = function() {
				node.DONE();
			};
		});
		console.log('Instructions');
	};
		
	var ultimatum = function () {
		//////////////////////////////////////////////
		// nodeGame hint:
		//
		// var that = this;
		//
		// /this/ is usually a reference to node.game
		//
		// However, unlike in many progamming languages,
		// in javascript the object /this/ assumes
		// different values depending on the scope 
		// of the function where it is called.
		//
		/////////////////////////////////////////////
		var that = this;
		node.window.loadFrame('html/solo.html', function () {
			
			
			//////////////////////////////////////////////
			// nodeGame hint:
			//
			//	nodeGame offers several types of event
			//  listeners. They are all resemble the syntax
			//
			//  node.on<[DATA,TXT,PLIST, etc]>
			//
			//	Whenever, a 
			//
			//  The low level event listener is simply 
			//
			//  node.on
			//
			/////////////////////////////////////////////
			node.onDATA('BIDDER', function (msg) {
				
				that.other = msg.data.other;
				console.log('OTHER ' + msg.data.other);
				
				node.set('ROLE', 'BIDDER');
				node.window.loadFrame('html/bidder.html', function () {

					var root = node.window.getElementById('root');
					var b = node.window.getElementById('submitOffer');
					
					b.onclick = function() {
						var offer = node.window.getElementById('offer');
						//////////////////////////////////////////////
						// nodeGame hint:
						//
						// nodeGame offers the possibility to send
						// messages both to the nodeGame server and 
						// to other players. For example:
						//
						// - node.say -> sends data to player or server.
						//   It will be upon the receiver what to do
						//   the incoming data.
						//
						// - node.set -> stores in the memory of the 
						//   server a piece of information.
						//
						/////////////////////////////////////////////
						node.set('offer', offer.value);
						node.say(offer.value, 'OFFER', that.other);
						node.window.write(' Your offer: ' +  offer.value);
					};
					
					node.onDATA('ACCEPT', function (msg) {
							node.window.write('Your offer was accepted');
							node.DONE();
					});
						
					node.onDATA('REJECT', function (msg) {
						node.window.write('Your offer was rejected');
						node.DONE();
					});
				});
			});
				
			node.onDATA('RESPONDENT', function (msg) {
				that.other = msg.data.other;
				node.set('ROLE', 'RESPONDENT');
				
				node.window.loadFrame('html/resp.html', function () {
					
					node.onDATA('OFFER', function (msg) {			
						var offered = node.window.getElementById('offered');
						node.window.write('You received an offer of ' + msg.data, offered);
						offered.style.display = '';
					
						var accept = node.window.getElementById('accept');
						var reject = node.window.getElementById('reject');
						
						accept.onclick = function() {
							node.set('response','ACCEPT');
							node.say('ACCEPT', 'ACCEPT', that.other);
							node.DONE();
						};
						
						reject.onclick = function() {
							node.set('response','REJECT');
							node.say('REJECT', 'REJECT', that.other);
							node.DONE();
						};
					});
			});
			
			node.onDATA('SOLO', function() {
				console.log('solodone');
				//////////////////////////////////////////////
				// nodeGame hint:
				//
				// node.DONE() communicates to the server that 
				// the player has completed the current state.
				//
				// What happens next, depends on the game. 
				// In this game the player will have to wait
				// until all the other players are also "done".
				// 
				/////////////////////////////////////////////
				node.DONE();
			});
				
		});
	
			console.log('Ultimatum');
		});
	};
	
	var postgame = function(){
		node.window.loadFrame('html/postgame.html', function(){
			node.random.emit('DONE');
		});
		console.log('Postgame');
	};
	
	var endgame = function(){
		node.window.loadFrame('html/ended.html');
		console.log('Game ended');
	};
	
	// Creating the game loop
	//////////////////////////////////////////////
	// nodeGame hint:
	//
	// The /loops/ object defines the all the 
	// states of the game, and the order in which
	// they will be called.
	// 
	// Every state is an object that, in its
	// simplest form, contains only a function.
	// However, it can also contained nested 
	// functions and other information, such as
	// the maximum amount of time each player
	// has to complete the state.
	//
	/////////////////////////////////////////////
	this.loops = {
		1: {state: pregame,
			name: 'Game will start soon'
		},
		
		2: {state: instructions,
			name: 'Instructions'
		},
		
		3: {rounds: 10, 
			state:  ultimatum,
			name: 'Ultimatum Game'
		}, 
		
		4: {state: postgame,
			name: 'Questionnaire'
		},
		
		5: {state: endgame,
			name: 'Thank you!'
		}
	};	
};
