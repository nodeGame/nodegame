function PeerReviewGame () {
	
	this.name = 'Peer Review Game';
	this.description = 'Create, submit, and evaluate contributions from your peers.';
	this.version = '0.1';
	
	this.automatic_step = false;
	
	this.minPlayers = 2;
	this.maxPlayers = 8;
	
	this.init = function() {			
		node.window.setup('PLAYER');
	};
	
	
	
	var pregame = function() {

		
		var frame = node.window.loadFrame('pregame.html');
		node.emit('DONE');
		console.log('Pregame');
	};
	
	var instructions = function(){
		var that = this;
		node.window.loadFrame('instructions.html', function() {
			
			var b = node.window.getElementById('read');
			
			b.onclick = function() {
				node.DONE('Instructions have been read.');
				node.fire('WAIT');
			};
			
		});
		console.log('Instructions');
	};
	

	var questionnaire = function(){
		var that = this;
		node.window.loadFrame('postgame.html');
		console.log('Postgame');
	};
	
	var endgame = function(){
		node.window.loadFrame('ended.html');
		console.log('Game ended');
	};
	
	var creation = function(){
		var that = this;
		node.window.loadFrame('creation.html', function(){
			
			var root = node.window.getElementById('root');
			//'cf', {width: 500, height:500};
			var cf_options = { width: 300, height: 300 };
			node.window.addWidget('ChernoffFaces', root, cf_options);
			
			// Add timer
			var timerOptions = {event: 'DONE'};
			node.window.addWidget('VisualTimer',root, timerOptions);
			
		});

		console.log('Creation');
	};
	
	
	var submission = function() {
		
							
		node.window.addWidget('VisualTimer',root, timerOptions);
		
		
	};
	
	
	var evaluation = function(){
		var that = this;
		node.window.loadFrame('evaluation.html');
		
		
		console.log('Evaluation');
	};
	
	var dissemination = function(){
		var that = this;
		node.window.loadFrame('dissemination.html');
		
		console.log('Dissemination');
	};
	
	// Assigning Functions to Loops
	
	var pregameloop = {
		1: pregame
	};
	
	var instructionsloop = {
		1: instructions
	};
	
	var gameloop = { // The different, subsequent phases in each round
		1: creation,
		2: evaluation,
		3: dissemination
	};
	
	var postgameloop = {
		1: questionnaire
	};
	
	var endgameloop = {
		1: endgame
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