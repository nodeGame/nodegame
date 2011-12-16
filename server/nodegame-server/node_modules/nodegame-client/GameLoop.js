(function (exports, node) {
	
	var GameState = node.GameState;
	var Utils = node.Utils;
	
	/*
	 * GameLoop
	 * 
	 * Handle the states of the game
	 * 
	 */
	
	/**
	 * Expose constructor
	 */
	
	exports.GameLoop = GameLoop;
	
//	function GameLoop (loop) {
//		this.loop = loop;
//		
//		this.limits = Array();
//		
//		for (var key in this.loop) {
//			if (this.loop.hasOwnProperty(key)) {
//				var round = loop[key].rounds || 1;
//				this.limits.push({rounds:round,steps:Utils.getListSize(this.loop[key]['loop'])});
//			}
//		}
//		
//		this.nStates = this.limits.length;
//		
//	}
	
	function GameLoop (loop) {
		this.loop = loop;
		
		this.limits = Array();
		
		for (var key in this.loop) {
			if (this.loop.hasOwnProperty(key)) {
				
				// Transform the loop obj if necessary.
				// When a state executes only one step,
				// it is allowed to pass directly the name of the function.
				// So such function must be incapsulated in a obj here.
				var loop = this.loop[key]['state'];
				if ('function' === typeof loop) {
					var steps = 1;
					this.loop[key]['state'] = {1: {state: loop,
												   name: this.loop[key].name || key + '.1.1'
												}};
				}
				
				var steps = Utils.getListSize(this.loop[key]['state'])
				
				
				var round = this.loop[key].rounds || 1;
				this.limits.push({rounds:round,steps:steps});
			}
		}
		
		this.nStates = this.limits.length;
	}
	
	
	GameLoop.prototype.exist = function (gameState) {
	
		if (typeof(this.loop[gameState.state]) === 'undefined') {
			console.log('(E): Unexisting state: ' + gameState.state);
			return false;
		}
		
		if (typeof(this.loop[gameState.state]['state'][gameState.step]) === 'undefined'){
			console.log('(E): Unexisting step: ' + gameState.step);
			return false;
		}
		// States are 1 based, arrays are 0-based => -1
		if (gameState.round > this.limits[gameState.state-1]['rounds']) {
			console.log('(E): Unexisting round: ' + gameState.round + 'Max round: ' + this.limits[gameState.state]['rounds']);
			return false;
		}
		
		//console.log('This exist: ' + gameState);
			
		return true;
	};
			
	GameLoop.prototype.next = function (gameState) {

		//console.log('NEXT OF THIS ' + gameState);
		//console.log(this.limits);
		
		// Game has not started yet, do it!
		if (gameState.state === 0) {
			//console.log('NEXT: NEW');
			return new GameState({
								 state: 1,
								 step: 1,
								 round: 1
			});
		}
		
		if (!this.exist(gameState)) {
			console.log('No next state of non-existing state: ' + gameState);
			return false;
		}
		
		var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
		
		if (this.limits[idxLimit]['steps'] > gameState.step){
			var newStep = Number(gameState.step)+1;
	//		console.log('Limit: ' + this.limits[gameState.state]['steps']);
//			console.log('NEXT STEP: '  + new GameState({
//														state: gameState.state,
//														step: newStep,
//														round: gameState.round
//			}));
//			
			return new GameState({
				state: gameState.state,
				step: newStep,
				round: gameState.round
			});
		}
		
		if (this.limits[idxLimit]['rounds'] > gameState.round){
			var newRound = Number(gameState.round)+1;
			//console.log('NEXT ROUND: ' + new GameState(gameState.state,1,newRound));
			return new GameState({
				state: gameState.state,
				step: 1,
				round: newRound
			});
		}
		
		if (this.nStates > gameState.state){		
			var newState = Number(gameState.state)+1;
			//console.log('NEXT STATE: ' + new GameState(newState,1,1));
			//return new GameState(newState,1,1);
			return new GameState({
				state: newState,
				step: 1,
				round: 1
			});
		}
		
		return false; // game over
	};
	
	GameLoop.prototype.previous = function (gameState) {
		
		if (!this.exist(gameState)) {
			console.log('No previous state of non-existing state: ' + gameState);
		}
		
		var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
		
		if (gameState.step > 1){
			var oldStep = Number(gameState.step)-1;
			//return new GameState(gameState.state,oldStep,gameState.round);
			return new GameState({
				state: gameState.state,
				step: oldStep,
				round: gameState.round
			});
		}
		else if (gameState.round > 1){
			var oldRound = Number(gameState.round)-1;
			var oldStep = this.limits[idxLimit]['steps'];
			return new GameState({
				state: gameState.state,
				step: oldStep,
				round: oldRound
			});
		}
		else if (gameState.state > 1){
			var oldRound = this.limits[idxLimit-1]['rounds'];
			var oldStep = this.limits[idxLimit-1]['steps'];
			var oldState = idxLimit;
			return new GameState({
				state: oldState,
				step: oldStep,
				round: oldRound
			});
		}
		
		return false; // game init
	};
	
	GameLoop.prototype.getName = function(gameState) {
		if (!this.exist(gameState)) return false;
		return this.loop[gameState.state]['state'][gameState.step]['name'];
	};
	
	GameLoop.prototype.getFunction = function(gameState) {
		if (!this.exist(gameState)) return false;
		return this.loop[gameState.state]['state'][gameState.step]['state'];
	};
	
	GameLoop.prototype.jumpTo = function (gameState, jump) {
		if (!this.exist(gameState)) return false;
		if (!jump || jump === 0) return gameState;
		
		var gs = gameState;	
		var func = (jump > 0) ? this.next : this.previous;
		
		for (var i=0; i < Math.abs(jump); i++) {
			gs = func.call(this,gs);
			if (!gs) return false;
		}
		
//		console.log('FROM');
//		console.log(gameState);		
//		console.log('TO');
//		console.log(gs);
		
		return gs;
	};
	

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);