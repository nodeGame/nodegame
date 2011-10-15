function Monitor_Ultimatum () {
	
	this.name = 'Monitor for Ultimatum';
	this.description = 'No Description';
	this.version = '0.1';
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.automatic_step = false;
	
	this.init = function() {
		nodeWindow.setup('MONITOR');
	};
	
	var pregame1 = function(){
		console.log('Pregame');
	};
	
	var instructions = function(){
		console.log('Instructions');
	};
		
	var game = function(){
		var that = this;
		var groups = this.pl.getNGroups((this.pl.size()/2));
		
		var i;
		var g = null;
		for(i=0;i<groups.length;i++){
			g = groups[i];
			console.log(g);
			console.log(g.size());
			if (g.size() > 1) {
				// Bidder
				var bidder = g.getRandom();
				//console.log(bidder);
				g.remove(bidder.id);				
				node.fire('out.say.DATA', 'BIDDER', bidder.id);
				
				// Respondent
				var respondent = g.getRandom();
				//console.log(respondent);
				node.fire('out.say.DATA', 'RESPONDENT', respondent.id);

				// Make each other aware
				node.fire('out.say.DATA', 'OTHER', bidder.id, respondent.id);
				node.fire('out.say.DATA', 'OTHER', respondent.id, bidder.id);

			}
			else {
				var solo =  g.getRandom();
				console.log(solo);
				node.fire('out.say.DATA', 'SOLO',respondent.id);
			}	
		}
		console.log('Game1');
	};
	
	var postgame1 = function(){
		console.log('Postgame');
	};
	
	var endgame1 = function(){
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
		1: game
	};
	
	var postgameloop = {
		1: postgame1
	};
	
	var endgameloop = {
		1: endgame1
	};
	
	
	// Creating the game object
		
	// LOOPS
	this.loops = {
			1: {loop:pregameloop},
			2: {loop:instructionsloop},
			3: {rounds:10, loop:gameloop},
			4: {loop:postgameloop},
			5: {loop:endgameloop}
		};	
}