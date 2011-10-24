function Monitor_Test () {
	
	this.name = 'Test Game';
	this.description = 'Test Descr';
	this.version = '0.1';
	
	this.automatic_step = false;
	
	this.minPlayers = 2;
	this.maxPlayers = 10;
	
	this.init = function() {		
		node.window.setup('MONITOR');
	};
	
	var counter = 0;
	
	var testf = function() {
		node.fire('out.say.DATA',counter++, 'ALL','untest');
	};
	
	var loopf = {
			1: testf
		};
	
	// LOOPS
	this.loops = {
			1: {rounds:5, loop:loopf},
			2: {rounds:5, loop:loopf}
		};	
}