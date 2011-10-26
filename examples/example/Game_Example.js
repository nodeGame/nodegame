function Game_Example () {
	
	this.name = 'Game Example';
	this.description = 'General description';
	this.version = '0.2';
	
	this.automatic_step = true;
	
	this.minPlayers = 1;
	this.maxPlayers = 10;
	
	this.init = function() {		
		node.window.setup('PLAYER');
	};
	
	
	var pregame1 = function() {
		var that = this;
		
		var frame = node.window.loadFrame('pregame.html', function() {

			that.addLocalListener("in.say.DATA", function(p,d){
				if (d.data === 'READY') {
					var root = node.window.getElementById('root');
					node.window.write(root,'Press the button to start the experiment');
					var button = node.window.addButton(root, 'sendb');
					button.onclick = function() {
						node.fire('DONE','User ready to start the experiment ');
						node.fire('WAIT');	
					};
				}
			});
		});
		console.log('Pregame');
	};
	
	var instructions = function(){
	
		var that = this;
		
		node.window.loadFrame('instructions.html', function(p,d) {
			var root = node.window.getElementById('root');
			var b = node.window.addButton(root,'I have read and understood the instructions');
			b.onclick = function() {
				node.DONE('Done for now...');
				node.fire('WAIT');
			};
		});
		
		console.log('Instructions');
	};
	
	var postgame1 = function(){
		var that = this;
		node.window.loadFrame('postgame.html');
		
		var randomWait = 1000+Math.random()*2000;
		
		setTimeout(function() {
			node.DONE('Done PostGame');
		},randomWait);
		
		console.log('Postgame');
	};
	
	var endgame1 = function(){
		node.window.loadFrame('ended.html');
		console.log('Game ended');
	};
	
	var game1 = function(){
		
		var that = this;
		node.window.loadFrame('game1.html', function(){
			
			var root = node.window.getElementById('root');
			
			var button = node.window.addButton(root, 'sendb');
			
			button.onclick = function() {
				that.DATA('It works');
			};
			
			node.on("in.DATA", function(p,d){
				var button = node.window.addButton(root, 'sendb');
				node.window.write(root,d.data);
				var n = document.createTextNode(d.data);
				var div = document.createElement('div');
				div.appendChild(n);
				node.window.addDiv(root,div);
				document.body.appendChild(n);
				console.log('All this done');
					
				node.window.frame.innerHTML += d.data;
				node.window.addDiv(node.window.frame,div);
			});
			
			
			var buttondone = node.window.addButton(root, 'sendb',{value: 'DONE'});

			buttondone.onclick = function() {
				node.DONE('Game1 Done');
				node.fire('WAIT');	
			};
			
		
		});
		
		console.log('Game1');
	};
	
	var game2 = function(){
		
		node.window.loadFrame('game2.html');
		
		var randomWait = 1000+Math.random()*2000;
		setTimeout(function() {
			node.DONE('Done Game2');
		},randomWait);
		
		console.log('Game2');
	};
	
	var game3 = function(){
		
		node.window.loadFrame('game3.html');
		
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