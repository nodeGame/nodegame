(function (exports) {
	
	/*
	 * GameState
	 * 
	 * Representation of a state of the game
	 * 
	 */
	
	/**
	 * Expose constructor
	 */
	
	exports.GameState = GameState;
	
	GameState.iss = {};

	GameState.iss.UNKNOWN = 0;
	GameState.iss.LOADING = 10;
	GameState.iss.PLAYING = 50;
	GameState.iss.DONE = 100;
	
	function GameState (gs) {
		
		// TODO: The check for gs is done many times. Change it.
		if (gs) {
			this.state = 	gs.state;
			this.step = 	gs.step;
			this.round = 	gs.round;
			this.is = 		(gs.is) ? gs.is : GameState.iss.UNKNOWN;
			this.paused = 	(gs.paused) ? gs.paused : false;
		}
		else {
			this.state = 	0;
			this.step = 	0;
			this.round = 	0;
			this.is = 		GameState.iss.UNKNOWN;
			this.paused = 	false;
		}
	}
	
	GameState.prototype.toString = function () {
		var out = this.state + '.' + this.step + ':' + this.round + '_' + this.is;
		
		if (this.paused) {
			out += ' (P)';
		}
		return out;
	};
	
	// Compares two GameStates. 
	// If they are equal returns 0,
	// If gm1 is more ahead returns 1, vicersa -1;
	// If strict is set, also the is property is compared
	GameState.compare = function (gs1, gs2, strict) {
		var strict = strict || false;
			
		var result = gs1.state - gs2.state;
		
		if (result === 0) {
			result = gs1.round - gs2.round;
			
			if (result === 0) {
				result = gs1.step - gs2.step;
				
				if (strict && result === 0) {
					result = gs1.is - gs2.is;
				}
			}
		}
		//console.log('EQUAL? ' + result);
		
		return result;
	};
	
	GameState.stringify = function (gs) {
		return gs.state + '.' + gs.step + ':' + gs.round + '_' + gs.is;
	}; 

})('undefined' != typeof node ? node : module.exports);