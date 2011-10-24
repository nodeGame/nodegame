function PeerReviewGame () {
	
	this.name = 'Peer Review Game';
	this.description = 'Create, submit, and evaluate contributions from your peers.';
	this.version = '0.1';
	
	this.automatic_step = true;
	
	this.minPlayers = 8;
	this.maxPlayers = 8;
	
	this.init = function() {		
		var that = this;	
		nodeWindow.setup('PLAYER');
		var root = document.getElementById('root');
		var ws = new WaitScreen(this);
		nodeWindow.addGadget(root, ws);		
//		var wall = new Wall(this);
//		nodeWindow.addGadget(root,wall);
	};
	
	
	
	var pregame = function() {
		var frame = nodeWindow.loadFrame('pregame.html');
		console.log('Pregame');
	};
	
	var instructions = function(){
		var that = this;
		nodeWindow.loadFrame('http://localhost/nodegame/dev/server/games/peer-review/instructions.html', function() {
			var b = window.frames['mainframe'].document.getElementById('read');
			b.onclick = function() {
				node.DONE('Instructions have been read.');
				node.fire('WAIT');
			};
		});
		console.log('Instructions');
	};
	

	var questionnaire = function(){
		var that = this;
		nodeWindow.loadFrame('http://localhost:8004/games/peer-review/postgame.html');
		console.log('Postgame');
	};
	
	var endgame = function(){
		nodeWindow.loadFrame('http://localhost:8004/games/peer-review/ended.html');
		console.log('Game ended');
	};
	
	var creation = function(){
		var that = this;
		nodeWindow.loadFrame('http://localhost:8004/games/peer-review/creation.html', function(){
			
			var root = nodeWindow.frame.getElementById('root');
			
			var cf = new ChernoffFaces('cf', {width: 500, height:500});
			cf.append(root);
	
		});
		
		
		console.log('Creation');
	};
	
	var evaluation = function(){
		var that = this;
		nodeWindow.loadFrame('http://localhost:8004/games/example/evaluation.html');
		
		
		console.log('Evaluation');
	};
	
	var dissemination = function(){
		var that = this;
		nodeWindow.loadFrame('http://localhost:8004/games/example/dissemination.html');
		
		
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