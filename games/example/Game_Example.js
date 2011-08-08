function Game_Example () {
	
	this.name = 'Game Example';
	this.description = 'General description';
	this.version = '0.2';
	
	this.automatic_step = true;
	
	this.minPlayers = 1;
	this.maxPlayers = 10;
	
	this.init = function() {		
		var that = this;	
		nodeWindow.setup('PLAYER');
		var root = document.getElementById('root');
		//console.log(nodeGame);
		
		
//		var ws = node.gadgets.WaitScreen(this);
//		console.log(ws);
//		console.log(nodeGame.gadgets.WaitScreen);
		
		var ws = new WaitScreen(this);
		nodeWindow.addGadget(root, ws);
//		
		
//		var wall = new Wall(this);
//		nodeWindow.addGadget(root,wall);
	};
	
	
	
	var pregame1 = function() {
		var that = this;
		
		var frame = nodeWindow.loadFrame('games/example/pregame.html', function() {
				
			var frame = nodeWindow.frame;		
			var frame = nodeWindow.getFrame();
			var root = nodeWindow.frame.getElementById('root');
			
			that.addLocalListener("in.say.DATA", function(p,d){
				if (d.data === 'READY') {
					var root = nodeWindow.frame.getElementById('root');
					var root = window.frames['mainframe'].document.getElementById('root');
					console.log('Root' + root);
					nodeWindow.write(root,'Press the button to start the experiment');
					var button = nodeWindow.addButton(root, 'sendb');

					button.onclick = function() {
						node.fire('DONE','User ready to start the experiment ');
						node.fire('WAIT');	
					};
				}
			});
			
		
		});

		var randomWait = 1000+Math.random()*2000;
		
		setTimeout(function() {
			node.DONE('Done Game2');
		},randomWait);
		
		
		console.log('Pregame');
	};
	
	var instructions = function(){
	
		var that = this;
		
		nodeWindow.loadFrame('games/example/instructions.html', function(p,d) {

			var frame = nodeWindow.frame;		
			var frame = nodeWindow.getFrame();
			var root = window.frames['mainframe'].document.getElementById('root');
			var root = nodeWindow.frame.getElementById('root');
	
			var b = nodeWindow.addButton(root,'I have read and understood the instructions');
			
			b.onclick = function() {
				node.DONE('Done for now...');
				node.fire('WAIT');
			};
		});
		
//		var randomWait = 1000+Math.random()*2000;
//		
//		setTimeout(function() {
//			node.DONE('Done Game2');
//		},randomWait);
//		
		console.log('Instructions');
	};
	
	var postgame1 = function(){
		var that = this;
		nodeWindow.loadFrame('games/example/postgame.html');
		
		var randomWait = 1000+Math.random()*2000;
		
		setTimeout(function() {
			node.DONE('Done PostGame');
		},randomWait);
		
		console.log('Postgame');
	};
	
	var endgame1 = function(){
	
		nodeWindow.loadFrame('games/example/ended.html');
		console.log('Game ended');
	};
	
	var game1 = function(){
		
		var that = this;
		nodeWindow.loadFrame('games/example/game1.html', function(){
			
			var root = nodeWindow.frame.getElementById('root');
			
			var button = nodeWindow.addButton(root, 'sendb');
			
			button.onclick = function() {
				that.DATA('FUNZIA');
							
			};
			
			node.on("in.DATA", function(p,d){
					
				var root = that .window.frame.getElementById('root');
				var button = nodeWindow.addButton(root, 'sendb');
				console.log('STE: ' + root);
				nodeWindow.write(root,d.data);
				var n = document.createTextNode(d.data);
				var div = document.createElement('div');
				div.appendChild(n);
				nodeWindow.addDiv(root,div);
				document.body.appendChild(n);
				console.log('all this done');
				
				
				
				nodeWindow.frame.innerHTML += d.data;
				nodeWindow.addDiv(nodeWindow.frame,div);
				
			});
			
			
			var buttondone = nodeWindow.addButton(root, 'sendb',{value: 'DONE'});

			buttondone.onclick = function() {
				node.DONE('Game1 Done');
				node.fire('WAIT');	
			};
			
		
		});
		
		var randomWait = 1000+Math.random()*2000;
		
		setTimeout(function() {
			node.DONE('Done Game2');
		},randomWait);
		
		console.log('Game1');
	};
	
	var game2 = function(){
		var that = this;
		nodeWindow.loadFrame('games/example/game2.html');
		
		var randomWait = 1000+Math.random()*2000;
		
		setTimeout(function() {
			node.DONE('Done Game2');
		},randomWait);
		
		console.log('Game2');
	};
	
	var game3 = function(){
		var that = this;
		nodeWindow.loadFrame('games/example/game3.html');
		
		var randomWait = 1000+Math.random()*2000;
		
		setTimeout(function() {
			node.DONE('Done Game3');
		},randomWait);
		
		console.log('Game3');
	};
	
	// Assigning Functions to Loops
	
	var pregameloop = {
		1: pregame1
	};
	
	var instructionsloop = {
		1: instructions
	};
	
	var gameloop = { // The different, subsequent phases in each round
		1: game1,
		2: game2,
		3: game3
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