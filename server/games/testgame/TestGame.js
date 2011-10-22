function Test () {
	
	this.name = 'Test Game';
	this.description = 'Test Descr';
	this.version = '0.1';
	
	this.automatic_step = false;
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	var counter = 0;
	
	this.init = function() {		
		nodeWindow.setup('PLAYER');
		
		node.onDATA(function(msg){
			console.log(counter++ + ' ' + msg.data);
		});
		
	};
	
	var testf = function() {
		
		node.printAllListeners();
		
		node.onDATA(function(msg){
			console.log('AAA' + ' ' + msg.data);
		});
		
		
	};
	
	var testf2 = function() {
		
		node.printAllListeners();
		
		node.onDATA(function(msg){
			console.log('BBB' + ' ' + msg.data);
		});
		
		
	};
	
	
	// LOOPS
	this.loops = {
			1: {rounds:5, loop:{1:testf}},
			2: {rounds:5, loop:{1:testf2}}
		};	
}