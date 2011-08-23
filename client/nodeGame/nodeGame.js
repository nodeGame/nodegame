/*!
 * nodeGame
 */

if (typeof(WebSocket) === 'undefined') {
	alert('Sorry, Web Sockets are not supported in this browser. Aborting...');
	return;
}

nodeGame.prototype = new EventListener();
nodeGame.prototype.constructor = nodeGame;

// Exposing classes

nodeGame.prototype.create = {};

nodeGame.prototype.create.GameLoop = function(loop){
	return new GameLoop(loop);
};

nodeGame.prototype.create.GameMsgGenerator = function(session,sender,currentState){
	return new GameMsgGenerator(session,sender,currentState);
};

nodeGame.prototype.create.GameMsg = function(session, currentState, action, 
											target, from, to, text, data,
											priority, reliable) {
	
	return new GameMsg(session, currentState, action, target, from, to, text, data,
			priority, reliable);
};

nodeGame.prototype.create.GameState = function(state,step,round){
	return new GameState(state,step,round);
};

nodeGame.prototype.create.PlayerList = function(list){
	return new PlayerList(list);
};

// Exposing Costants

nodeGame.prototype.actions = GameMsg.actions;

nodeGame.prototype.IN = GameMsg.IN;
nodeGame.prototype.OUT = GameMsg.OUT;

nodeGame.prototype.targets = GameMsg.targets;
			
nodeGame.prototype.states = GameState.iss;

// Constructor

function nodeGame() {
	EventListener.call(this);

	this.gsc = null;
	this.game = null;
	var that = this;

	this.state = function() {
		return (this.game) ? this.game.gameState : false;
	};
	
	this.on = function(event,listener) {
		var state = this.state();
		//console.log(state);
		
		// It is in the init function;
		if (!state || (GameState.compare(state, new GameState(), true) === 0 )) {
			that.addListener(event, listener);
			//console.log('global');
		}
		else {
			that.addLocalListener(event, listener);
			//console.log('local');
		}
		
		
	};
	
	this.play = function (net,game) {

		console.log('nodeGame: connecting to server...');		
		that.gsc = new GameSocketClient(net);
		
		that.game = new Game(game, that.gsc);
		that.game.init();
		
		that.gsc.setGame(that.game);
		
		console.log('nodeGame: game loaded...');
		console.log('nodeGame: ready.');
	};	
	
	
	
	// *Aliases*
	//
	// Conventions:
	//
	// - Direction:
	// 		'in' for all
	//
	// - Target:
	// 		DATA and TXT are 'say' as default
	// 		STATE and PLIST are 'set' as default
	
	
	// Sending
	
	// Send a GameMsg to the recipient
	// gameMSg must be a valid GameMsg
	this.send = function(gameMsg,to) {
		that.gsc.send(gameMsg,to);
	};
	
//	this.setSTATE = function(action,state,to){	
//		var stateEvent = GameMsg.OUT + action + '.STATE'; 
//		fire(stateEvent,action,state,to);
//	};
	
	// Receiving
	
	// Say
	
	this.onTXT = this.onTXTin = function(func) {
		that.on("in.say.TXT", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	this.onDATA = this.onDATAin = function(func) {
		that.on("in.say.DATA", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	// Set
	
	this.onSTATE = this.onSTATEin = function(func) {
		that.on("in.set.STATE", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	this.onPLIST = this.onPLISTin = function(func) {
		that.on("in.set.PLIST", function(msg) {
			func.call(that.game,msg);
		});
		
		that.on("in.say.PLIST", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	this.DONE = function(text){
		node.fire("DONE",text);
	};
};