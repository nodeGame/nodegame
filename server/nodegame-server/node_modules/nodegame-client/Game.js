(function (exports, node) {
	
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var PlayerList = node.PlayerList;
	var GameLoop = node.GameLoop;
	var Utils = node.Utils;
	
	/*
	 * Game
	 *
	 */
	
	/**
	 * Expose constructor
	 */
	exports.Game = Game;
	
	function Game (settings, gamesocketclient) {
		
		// TODO: transform into private variables, otherwise they can accidentally 
		// modified  by the execution of the loops functions
		
		// If not defined they take default settings
		this.name = settings.name || "A standard game";
		this.description = settings.description || 'No Description';
		
		this.gameLoop = new GameLoop(settings.loops);
		
		// TODO: gameState should be inside player
		this.player = null;	
		this.gameState = new GameState();
		
		this.automatic_step = settings.automatic_step || false;
		
		this.minPlayers = settings.minPlayers || 1;
		this.maxPlayers = settings.maxPlayers || 1000;
		
		// TODO: Check this
		this.init = settings.init || this.init;
		
		this.gsc = gamesocketclient;
		
		this.pl = new PlayerList();
		
		var that = this;
		var say = GameMsg.actions.SAY + '.';
		var set = GameMsg.actions.SET + '.';
		var get = GameMsg.actions.GET + '.'; 	
		var IN  = GameMsg.IN;
		var OUT = GameMsg.OUT;
		
		// INCOMING EVENTS
		var incomingListeners = function() {
			
			// Set
			
			node.on( IN + set + 'STATE', function(msg){
				that.updateState(msg.data);
			});
			
			// TODO: Also for set.PLIST
			
			// Say
			
			node.on( IN + say + 'PLIST', function(msg) {
				that.pl = new PlayerList(msg.data);
				// If we go auto
				if (that.automatic_step) {
					//console.log('WE PLAY AUTO');
					var morePlayers = that.minPlayers - that.pl.size();
					
					if (morePlayers > 0 ) {
						node.fire('OUT.say.TXT', morePlayers + ' player/s still needed to begin the game');
						console.log( morePlayers + ' player/s still needed to begin the game');
					}
					// TODO: differentiate between before the game starts and during the game
					else if (that.pl.isStateDone(that.gameState)) {		
						node.fire('OUT.say.TXT', this.minPlayers + ' players connected. Game can start');
						console.log( this.minPlayers + ' players connected. Game can start');
						that.updateState(that.next());
					}	
				}
	//			else {
	//				console.log('WAITING FOR MONITOR TO STEP');
	//			}
			});
		}();
		
		var outgoingListeners = function() {
	
			// SET
			
			node.on( OUT + set + 'STATE', function(state,to){
				that.gsc.sendSTATE('set',state,to);
			});		
		
			// SAY
			
			node.on( OUT + say + 'STATE', function(state,to){
				//console.log('BBBB' + p + ' ' + args[0] + ' ' + args[1] + ' ' + args[2]);
				that.gsc.sendSTATE('say',state,to);
			});	
			
			node.on( OUT + say + 'TXT', function(text,to){
				that.gsc.sendTXT(text,to);
			});
			
			node.on( OUT + say + 'DATA', function(data,to,msg){
				that.gsc.sendDATA(data,to,msg);
			});
			
			node.on('DONE', function(msg){
				that.is(GameState.iss.DONE);
			});
			
			node.on('WAIT', function(msg){
				that.gameState.paused = true;
				that.publishState();
			});
			
		}();
		
	}
	
	//Game.prototype.addLocalListener = function (type,func,state) {
	//	var state = state || this.gameState;
	//	// TODO: check why I was calling this function
	//	//node.on(type,func);
	//	
	//	if (typeof this._localListeners[type] == "undefined"){
	//        this._localListeners[type] = [];
	//    }
	//
	//    this._localListeners[type].push(func);
	//};
	
	// Dealing with the STATE
	
	
	Game.prototype.pause = function() {
		this.gameState.paused = true;
	};
	
	Game.prototype.resume = function() {
		this.gameState.paused = false;
	};
	
	Game.prototype.next = function() {
		return this.gameLoop.next(this.gameState);
	};
	
	Game.prototype.previous = function() {
		return this.gameLoop.previous(this.gameState);
	};
	
	Game.prototype.is = function(is) {
		//console.log('IS ' + is);
		this.gameState.is = is;
		// TODO Check whether we should do it here or no
		this.publishState();
	};
	
	Game.prototype.publishState = function() {
		this.gsc.gmg.state = this.gameState;
		// Important: SAY
		//this.STATE(GameMsg.actions.SAY,this.gameState, 'ALL');
		var stateEvent = GameMsg.OUT + GameMsg.actions.SAY + '.STATE'; 
		node.fire(stateEvent,this.gameState,'ALL');
		console.log('I: New State = ' + this.gameState);
	};
	
	Game.prototype.updateState = function(state) {
		
		console.log('New state is going to be ' + new GameState(state));
		
		if (this.step(state) !== false){
			this.paused = false;
			this.is(GameState.iss.PLAYING);
			node.fire('STATECHANGE', this.gameState);
		}
		else {
			// TODO: implement sendERR
			node.fire('TXT','State was not updated');
			this.publishState(); // Notify anyway what happened
		}
	};
	
	
	Game.prototype.step = function(state) {
		
		// If not parameter is passed, it goes one step ahead
		var nextState = state.state || this.gameState.state;
		var nextRound = state.round || this.gameState.round;
		var nextStep = state.step || this.gameState.step++;
		
		var gameState = new GameState({state: nextState,
									   step: nextStep,
									   round: nextRound
									  });
		
		if (this.gameLoop.exist(gameState)) {			
			this.gameState = gameState;
			
			// Local Listeners from previous state are erased before proceeding
			// to next one
			node.node.clearLocalListeners();
			return this.gameLoop.getFunction(this.gameState).call(this);
		}
	
		return false; 
	};
	
	Game.prototype.init = function() {
		
	//	var header = this.window.addHeader(document.getElementById('root'), 'header');
	//	header.innerHTML = '<h1>'+ this.name + '</h1>';
	//	header.innerHTML += '<p>' + this.description + '</p>';
	//	var button = this.window.addButton(header,'sendbutton');
	//	
	//	var that = this;
	//	button.onclick = function() {
	//	  that.DONEWAIT('FUNZIA');
	//	};
	}; 

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
