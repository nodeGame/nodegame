/*!
 * nodeGame
 */

(function (exports) {
	
	var node = exports;
	var EventEmitter = node.EventEmitter;
	var GameSocketClient = node.GameSocketClient;
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var Game = node.Game;
	
	/**
	 * Expose constructor
	 * 
	 */
	exports.nodeGame = nodeGame;
	
	nodeGame.prototype.__proto__ = EventEmitter.prototype;
	nodeGame.prototype.constructor = nodeGame;
	
	// Exposing classes
	
//	exports.nodeGame.prototype.create = {};
//	
//	nodeGame.prototype.create.GameLoop = function (loop) {
//		return new GameLoop(loop);
//	};
//	
//	nodeGame.prototype.create.GameMsgGenerator = function (session, sender, state) {
//		return new GameMsgGenerator(session, sender, state);
//	};
//	
//	nodeGame.prototype.create.GameMsg = function(gm) {
//		
//		return new GameMsg({ 
//							session: gm.session, 
//							state: gm.state, 
//							action: gm.action, 
//							target: gm.target,
//							from: gm.from,
//							to: gm.to, 
//							text: gm.text, 
//							data: gm.data,
//							priority: gm.priority, 
//							reliable: gm.reliable
//		});
//	};
//	
//	nodeGame.prototype.create.GameState = function(gs){
//		return new GameState({
//								state: gs.state,
//								step: gs.step,
//								round: gs.round
//		});
//	};
//	
//	nodeGame.prototype.create.PlayerList = function(list){
//		return new PlayerList(list);
//	};
	
	// Exposing Costants
	
	nodeGame.prototype.actions = GameMsg.actions;
	
	nodeGame.prototype.IN = GameMsg.IN;
	nodeGame.prototype.OUT = GameMsg.OUT;
	
	nodeGame.prototype.targets = GameMsg.targets;
				
	nodeGame.prototype.states = GameState.iss;
	
	// Constructor
	
	function nodeGame() {
		EventEmitter.call(this);
		this.gsc = null;
		this.game = null;		
	};
	
	
	/**
	 * Creating an object
	 */
	var that = node.node = new nodeGame();
	
	node.state = function() {
		return (that.game) ? node.node.game.gameState : false;
	};
	
	node.on = function(event,listener) {
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
	
	node.play = function (conf, game) {	
		that.gsc = new GameSocketClient(conf);
		
		that.game = new Game(game, that.gsc);
		that.game.init();
		
		that.gsc.setGame(that.game);
		
		console.log('nodeGame: game loaded...');
		console.log('nodeGame: ready.');
	};	
	
	node.fire = function (event, p1, p2, p3) {	
		that.fire(event, p1, p2, p3);
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
	
	
// TODO: Check if this is ok to be commented
	
	// Send a GameMsg to the recipient
	// gameMSg must be a valid GameMsg
//	node.send = function(gameMsg,to) {
//		that.gsc.send(gameMsg,to);
//	};
	
	
	
	
//	this.setSTATE = function(action,state,to){	
//		var stateEvent = GameMsg.OUT + action + '.STATE'; 
//		fire(stateEvent,action,state,to);
//	};
	
	// Receiving
	
	// Say
	
	node.onTXT = node.onTXTin = function(func) {
		node.on("in.say.TXT", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.onDATA = node.onDATAin = function(func) {
		node.on("in.say.DATA", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	// Set
	
	node.onSTATE = node.onSTATEin = function(func) {
		node.on("in.set.STATE", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.onPLIST = node.onPLISTin = function(func) {
		node.on("in.set.PLIST", function(msg) {
			func.call(that.game,msg);
		});
		
		node.on("in.say.PLIST", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.DONE = function (text) {
		node.fire("DONE",text);
	};
	
	node.TXT = function (text, to) {
		node.fire('out.say.TXT', text, to);
	};
	
	
})('undefined' != typeof node ? node : module.exports);
//})('object' === typeof module ? module.exports : (window.node = {}));

	