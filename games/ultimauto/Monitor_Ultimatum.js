function Monitor_Ultimatum () {
	
	this.name = 'Monitor for Ultimauto game';
	this.description = 'No Description';
	this.version = '0.1';
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.automatic_step = false;
	
	this.init = function() {
		node.window.setup('MONITOR');
	};
	
	var pregame1 = function(){
		console.log('Pregame');
	};
	
	var instructions = function(){
		console.log('Instructions');
	};
		
	var game = function(){
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