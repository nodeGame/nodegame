function Ultimatum () {
	
	this.name = 'Ultimatum Game';
	this.description = 'Ultimatum Descr';
	this.version = '0.2';
	
	this.automatic_step = false;
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.BIDDER = 1;
	this.RESPONDENT = 0;
	
	this.init = function() {		
		node.window.setup('PLAYER');
	};
	
	
	var pregame1 = function() {
		var that = this;
		
		node.window.loadFrame('http://localhost/nodegame/dev/server/games/ultimatum/pregame.html', function() {
				
			var frame = node.window.frame;		
			
			 node.onDATA( function(msg){
			
				if (msg.data === 'READY') {
					var root = node.window.frame.getElementById('root');
					var root = window.frames['mainframe'].document.getElementById('root');
					//console.log('Root' + root);
					node.window.write(root,'Press the button to start the experiment');
					var button = node.window.addButton(root, 'sendb');

					button.onclick = function() {
						node.fire('DONE', 'User ready to start the experiment.');
						node.fire('WAIT');
					};
				}
			});
			
		
		});
	
		console.log('Pregame');
	};
	
	var instructions = function(){
	
		var that = this;
		
		node.window.loadFrame('http://localhost/nodegame/dev/server/games/ultimatum/instructions.html', function() {
	
			var b = window.frames['mainframe'].document.getElementById('read');
		
			b.onclick = function() {
				node.DONE('Done for now...');
				node.fire('WAIT');
			};
		});
		
		
		console.log('Instructions');
	};
		
	var ultimatum = function(){
		var that = this;		
		node.window.loadFrame('http://localhost:8004/games/ultimatum/solo.html');
				
		node.onDATA (function(msg){
					
			if (msg.data === 'BIDDER') {
				
				node.window.loadFrame('games/ultimatum/bidder.html', function(){

					var root = node.window.frame.getElementById('root');
					var b = node.window.frame.getElementById('submitOffer');
					
					b.onclick = function() {
						var offer = node.window.frame.getElementById('offer');
						node.fire('out.say.DATA','OFFER', that.other,offer.value);
						node.window.write(root,' Your offer: ' +  offer.value);
					};
					
					//node.printAllListeners();
					
					node.onDATA (function(msg) {
						
						if (msg.data === 'ACCEPT') {
							node.window.write(root, 'Your offer was accepted');
							node.DONE();
						}
						
						if (msg.data === 'REJECT') {
							node.window.write(root, 'Your offer was rejected');
							node.DONE();
						}
					});
					
				});
				
			}
			else if (msg.data === 'RESPONDENT') {
				
				node.window.loadFrame('http://localhost:8004/games/ultimatum/resp.html', function(){
				
					
					
					node.onDATA( function(msg) {
						
						if (msg.data === 'OFFER') {
							
							var offered = node.window.frame.getElementById('offered');
							node.window.write(offered, 'You received an offer of ' + msg.text);
							offered.style.display = '';
						}
						
					});
					
					
					var accept = node.window.frame.getElementById('accept');
					var reject = node.window.frame.getElementById('reject');
					
					
					accept.onclick = function() {
						node.fire('out.say.DATA', 'ACCEPT', that.other);
						node.DONE();
					};
					
					reject.onclick = function() {
						node.fire('out.say.DATA', 'REJECT', that.other);
						node.DONE();
					};
					
				});
			
			}
			
			else if (msg.data === 'OTHER') {
				that.other = msg.text;
			}
			
		});
			
	
		console.log('Game1');
	};
	
	var postgame1 = function(){
		var that = this;
		node.window.loadFrame('http://localhost:8004/games/ultimatum/postgame.html');
		
		//node.RANDOMDONE();
		
		console.log('Postgame');
	};
	
	var endgame1 = function(){
	
		node.window.loadFrame('http://localhost:8004/games/ultimatum/ended.html');
		console.log('Game ended');
	};
	
	// Assigning Functions to Loops
	
	var pregameloop = {
		1: pregame1
	};
	
	var instructionsloop = {
		1: instructions
	};
	
	var gameloop = { // The different, subsequent phases in each round
		1: ultimatum
	};
	
	var postgameloop = {
		1: postgame1
	};
	
	var endgameloop = {
		1: endgame1
	};
	
	
	// LOOPS
	this.loops = {
			1: {loop:pregameloop},
			2: {loop:instructionsloop},
			3: {rounds:10, loop:gameloop},
			4: {loop:postgameloop},
			5: {loop:endgameloop}
		};	
}