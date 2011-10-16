/*
 * GameState
 * 
 * Representation of a state of the game
 * 
 */

module.exports = GameState; 

GameState.iss = {};

GameState.iss.UNKNOWN = 0;
GameState.iss.STARTING = 10;
GameState.iss.PLAYING = 50;
GameState.iss.DONE = 100;

function GameState (gs) {
	
	// TODO: The check for gs is done many times. Change it.
	this.state = 	(gs) ? gs.state : 0;
	this.step = 	(gs) ? gs.step : 0;
	this.round = 	(gs) ? gs.round : 0;
	this.is = 		(gs) ? gs.is : GameState.iss.UNKNOWN;
	this.paused = 	(gs) ? gs.paused : false;
}

//function GameState (state,step,round) {
//	
//	// TODO: add checkings
//	this.state = state || 0;
//	this.step = step || 0;
//	this.round = round || 0;
//	
//	this.is = GameState.UNKNOWN;
//
//	this.paused = false;
//}
 
//GameState.prototype.import = function (gamestate) {
//	this.state = gamestate.state;
//	this.step = gamestate.step;
//	this.round = gamestate.round;
//	this.is = gamestate.is;
//};

GameState.prototype.toString = function () {
	var out = this.state + '.' + this.step + ':' + this.round + '_' + this.is;
	
	if (this.paused) {
		out += ' (P)';
	}
	return out;
};

//Compares two GameStates. 
//If they are equal returns 0,
//If gm1 is more ahead returns 1, vicersa -1;
//If strict is set, also the is property is compared
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
	
	console.log('UGUALI? ' + result);
	
	return result;
};

//GameState.parse = function(gamestate) {
//	try {
//		var gs = new GameState();
//		gs.import(gamestate);
//		return gs;
//	}
//	catch(e){
//		throw 'Error while trying to parsing GameState ' + e.message;
//	}
//};

GameState.stringify = function (gs) {
	return gs.state + '.' + gs.step + ':' + gs.round + '_' + gs.is;
};