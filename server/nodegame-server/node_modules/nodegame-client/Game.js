(function (exports, node) {
	
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var GameStorage = node.GameStorage;
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
		
		this.memory = new GameStorage(this);
		
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
				that.memory.add(msg.from, msg.data);
			});
			
			node.on( IN + set + 'DATA', function(msg){
				that.memory.add(msg.from, msg.data);
			});
			
			// Say

			// If the message is from the server, update the game state
			// If the message is from a player, update the player state
			node.on( IN + say + 'STATE', function(msg){
				
				// Player exists
				if (that.pl.exist(msg.from)) {
					//console.log('updatePlayer');
					that.pl.updatePlayerState(msg.from, msg.data);
					node.emit('UPDATED_PLIST');
					that.pl.checkState();
				}
				// Assume this is the server for now
				// TODO: assign a string-id to the server
				else {
					//console.log('updateState: ' + msg.from + ' -- ' + new GameState(msg.data));
					that.updateState(msg.data);
				}
			});
			
			node.on( IN + say + 'PLIST', function(msg) {
				that.pl = new PlayerList(msg.data);
				node.emit('UPDATED_PLIST');
				that.pl.checkState();
			});
		}();
		
		var outgoingListeners = function() {
			
			// SAY
			
			node.on( OUT + say + 'HI', function(){
				// Upon establishing a successful connection with the server
				// Enter the first state
				if (that.automatic_step) {
					that.updateState(that.next());
				}
				else {
					// The game is ready to step when necessary;
					that.gameState.is = GameState.iss.LOADED;
					that.gsc.sendSTATE(GameMsg.actions.SAY, that.gameState);
				}
			});
			
			node.on( OUT + say + 'STATE', function (state, to) {
				//console.log('BBBB' + p + ' ' + args[0] + ' ' + args[1] + ' ' + args[2]);
				that.gsc.sendSTATE(GameMsg.actions.SAY, state, to);
			});	
			
			node.on( OUT + say + 'TXT', function (text, to) {
				that.gsc.sendTXT(text,to);
			});
			
			node.on( OUT + say + 'DATA', function (data, to, msg) {
				that.gsc.sendDATA(GameMsg.actions.SAY, data,to,msg);
			});
			
			// SET
			
			node.on( OUT + set + 'STATE', function (state, to) {
				that.gsc.sendSTATE(GameMsg.actions.SET, state, to);
			});
			
			node.on( OUT + set + 'DATA', function (data, to) {
				that.gsc.sendDATA(GameMsg.actions.SET , data, to);
			});
			
		}();
		
		var internalListeners = function() {
			
			node.on('STATEDONE', function() {
				// If we go auto
				if (that.automatic_step) {
					//console.log('WE PLAY AUTO');
					var morePlayers = ('undefined' !== that.minPlayers) ? that.minPlayers - that.pl.size() : 0 ;
					
					if (morePlayers > 0 ) {
						node.emit('OUT.say.TXT', morePlayers + ' player/s still needed to play the game');
						console.log( morePlayers + ' player/s still needed to play the game');
					}
					// TODO: differentiate between before the game starts and during the game
					else {
						node.emit('OUT.say.TXT', this.minPlayers + ' players ready. Game can proceed');
						console.log( that.pl.size() + ' players ready. Game can proceed');
						that.updateState(that.next());
					}
				}
//				else {
//					console.log('WAITING FOR MONITOR TO STEP');
//				}
			});
			
			node.on('DONE', function(msg) {
				that.gameState.is = GameState.iss.DONE;
				that.publishState();
			});
			
			node.on('WAIT', function(msg) {
				that.gameState.paused = true;
				that.publishState();
			});
			
			node.on('WINDOW_LOADED', function(){
				if (that.isGameReady()) {
					node.emit('LOADED');
				}
			});
			
			node.on('GAME_LOADED', function() {
				if (that.isGameReady()) {
					node.emit('LOADED');
				}
			});
			
			node.on('LOADED', function(){
				that.gameState.is =  GameState.iss.PLAYING;
				//console.log('STTTEEEP ' + that.gameState.state);		
				that.gsc.clearBuffer();
			});
			
		}();
			
	}
	
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
	
//	Game.prototype.is = function(is) {
//		//console.log('IS ' + is);
//		this.gameState.is = is;
//		// TODO Check whether we should do it here or no
//		// this.publishState();
//	};
	
	Game.prototype.publishState = function() {
		//console.log('Publishing ' + this.gameState);
		this.gsc.gmg.state = this.gameState;
		// Important: SAY
		//this.STATE(GameMsg.actions.SAY,this.gameState, 'ALL');
		var stateEvent = GameMsg.OUT + GameMsg.actions.SAY + '.STATE'; 
		node.emit(stateEvent,this.gameState,'ALL');
		node.emit('STATECHANGE');
		console.log('I: New State = ' + this.gameState);
	};
	
	Game.prototype.updateState = function(state) {
		
		//console.log('New state is going to be ' + new GameState(state));
		
		if (this.step(state) !== false){
			this.paused = false;
			this.gameState.is =  GameState.iss.LOADED;
			if (this.isGameReady()) {
				node.emit('LOADED');
			}
		}		
		else {
			console.log('error in stepping');
			// TODO: implement sendERR
			node.emit('TXT','State was not updated');
			// Removed
			//this.publishState(); // Notify anyway what happened
		}
	};
	
	
	Game.prototype.step = function(state) {
		
		var gameState = state || this.next();
		if (gameState) {
			var func = this.gameLoop.getFunction(gameState);
			
			if (func) {
			
				gameState.is = GameState.iss.LOADING;
				this.gameState = gameState;
			
				// This could speed up the loading in other client,
				// but now causes problems of multiple update
				this.publishState();
				
				// Local Listeners from previous state are erased before proceeding
				// to next one
				node.node.clearLocalListeners();
				return func.call(this);
			}
		}
		
		return false;
		
	};
	
	Game.prototype.dump = function(reverse) {
		return this.memory.dump(reverse);
	}
	
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
	
	
	Game.prototype.isGameReady = function() {
		
		//console.log('GameState is : ' + this.gameState.is);
		
		if (this.gameState.is < GameState.iss.LOADED) return false;
		
		// Check if there is a gameWindow obj and whether it is loading
		if (node.window) {
			
			//console.log('WindowState is ' + node.window.state);
			return (node.window.state >= GameState.iss.LOADED) ? true : false;
		}
		
		return true;
	};
	

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
