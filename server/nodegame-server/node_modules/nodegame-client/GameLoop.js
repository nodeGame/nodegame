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
	
	function GameLoop (loop) {
		this.loop = loop || {};
		
		this.limits = Array();
		
		for (var key in this.loop) {
			if (this.loop.hasOwnProperty(key)) {
				
				// Transform the loop obj if necessary.
				// When a state executes only one step,
				// it is allowed to pass directly the name of the function.
				// So such function must be incapsulated in a obj here.
				var loop = this.loop[key].state;
				if ('function' === typeof loop) {
					var o = Utils.clone(this.loop[key]);
					//var steps = 1;
					this.loop[key].state = {1: o};
				}
				
				var steps = Utils.getListSize(this.loop[key].state)
				
				
				var round = this.loop[key].rounds || 1;
				this.limits.push({rounds: round, steps: steps});
			}
		}
		
		this.nStates = this.limits.length;
	}
	
	
	GameLoop.prototype.exist = function (gameState) {
		if (!gameState) return false;
		
		if (typeof(this.loop[gameState.state]) === 'undefined') {
			node.log('Unexisting state: ' + gameState.state, 'WARN');
			return false;
		}
		
		if (typeof(this.loop[gameState.state]['state'][gameState.step]) === 'undefined'){
			node.log('Unexisting step: ' + gameState.step, 'WARN');
			return false;
		}
		// States are 1 based, arrays are 0-based => -1
		if (gameState.round > this.limits[gameState.state-1]['rounds']) {
			node.log('Unexisting round: ' + gameState.round + 'Max round: ' + this.limits[gameState.state]['rounds'], 'WARN');
			return false;
		}
		
		//node.log('This exist: ' + gameState, 'ERR');
			
		return true;
	};
			
	GameLoop.prototype.next = function (gameState) {

		node.log('NEXT OF THIS ' + gameState, 'DEBUG');
		//node.log(this.limits);
		
		// Game has not started yet, do it!
		if (gameState.state === 0) {
			//node.log('NEXT: NEW');
			return new GameState({
								 state: 1,
								 step: 1,
								 round: 1
			});
		}
		
		if (!this.exist(gameState)) {
			node.log('No next state of non-existing state: ' + gameState, 'WARN');
			return false;
		}
		
		var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
		
		if (this.limits[idxLimit]['steps'] > gameState.step){
			var newStep = Number(gameState.step)+1;
	//		node.log('Limit: ' + this.limits[gameState.state]['steps']);
//			node.log('NEXT STEP: '  + new GameState({
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
			//node.log('NEXT ROUND: ' + new GameState(gameState.state,1,newRound));
			return new GameState({
				state: gameState.state,
				step: 1,
				round: newRound
			});
		}
		
		if (this.nStates > gameState.state){		
			var newState = Number(gameState.state)+1;
			//node.log('NEXT STATE: ' + new GameState(newState,1,1));
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
			node.log('No previous state of non-existing state: ' + gameState, 'WARN');
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
	
	GameLoop.prototype.getName = function (gameState) {
		if (!this.exist(gameState)) return false;
		return this.loop[gameState.state]['state'][gameState.step]['name'];
	};
	
	GameLoop.prototype.getAllParams = function (gameState) {
		if (!this.exist(gameState)) return false;
		return this.loop[gameState.state]['state'][gameState.step];
	};
	
	GameLoop.prototype.getFunction = function (gameState) {
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
		
//		node.log('FROM');
//		node.log(gameState);		
//		node.log('TO');
//		node.log(gs);
		
		return gs;
	};
	
	/**
	 * Compute the total number of steps to go.
	 */
	GameLoop.prototype.length = function (state) {
		var state = state || new GameState();
		var count = 0;
		while (state) { 
			//console.log(glCopy);
			count++;
			var state = this.next(state);
		}
		return count;
	};
	
	GameLoop.prototype.toArray = function() {
		var state = new GameState();
		var out = [];
		while (state) { 
			out.push(state.toString());
			var state = this.next(state);
		}
		return out;
	};
	
	GameLoop.prototype.indexOf = function (state) {
		if (!state) return -1;
		var idx = 0;
		var search = new GameState();
		while (search) {
			if (GameState.compare(search,state) === 0){
				return idx;
			}
			search = this.next(search);
			idx++;
		}
		return -1;
	};

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);