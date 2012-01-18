/*!
 * nodeGame
 */

(function (exports) {
	
	var node = exports;

	// Memory related operations
	// Will be initialized later
	node.memory = {};
	
	node.verbosity = 0;
	
	node.verbosity_levels = {
			ALWAYS: - Number.MIN_VALUE,
			ERR: -1,
			WARN: 0,
			INFO: 1,
			DEBUG: 3
	};
	
	node.log = function (txt, level) {
		if ('number' !== typeof level) {
			var level = node.verbosity_levels[level];
		}
		if (this.verbosity > level) {
			console.log(txt);
		}
	};

	// Load the auxiliary library if available in the browser
	if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
	if ('undefined' !== typeof NDDB) node.NDDB = NDDB; 
    
	// if node
	if ('object' === typeof module && 'function' === typeof require) {
	
		/**
	     * Expose Socket.io-client
	     *
	     * @api public
	     */
	
	    node.io = require('socket.io-client');
		
		/**
	     * Expose EventEmitter
	     *
	     * @api public
	     */
	
	    node.EventEmitter = require('./EventEmitter').EventEmitter;
	    
	    /**
	     * Expose JSU
	     *
	     * @api public
	     */
	
	    node.JSUS = require('JSUS').JSUS;
		
	    /**
	     * Expose Utils
	     *
	     * @api public
	     */
	
	    node.utils = node.Utils = require('./Utils').Utils;
	    
	    /**
	     * Expose GameState.
	     *
	     * @api public
	     */
	
	    node.GameState = require('./GameState').GameState;
	
	    /**
	     * Expose PlayerList.
	     *
	     * @api public
	     */
	
	    node.PlayerList = require('./PlayerList').PlayerList;
	    
	    /**
	     * Expose Player.
	     *
	     * @api public
	     */
	
	    node.Player = require('./PlayerList').Player;
	
	    
	    /**
	     * Expose GameMsg
	     *
	     * @api public
	     */
	
	     node.GameMsg = require('./GameMsg').GameMsg;
	
	    /**
	     * Expose GameLoop
	     *
	     * @api public
	     */
	
	    node.GameLoop = require('./GameLoop').GameLoop;
	
	    
	    /**
	     * Expose GameMsgGenerator
	     *
	     * @api public
	     */
	
	    node.GameMsgGenerator = require('./GameMsgGenerator').GameMsgGenerator;
	    
	    /**
	     * Expose GameSocketClient
	     *
	     * @api public
	     */
	
	    node.GameSocketClient = require('./GameSocketClient').GameSocketClient;
	    
	
	    /**
	     * Expose NDDB
	     *
	     * @api public
	     */
	  	
	    node.NDDB = require('NDDB').NDDB;
	    
	    /**
	     * Expose GameStorage
	     *
	     * @api public
	     */
	
	    node.GameDB = require('./GameDB').GameDB;
	    
	    /**
	     * Expose Game
	     *
	     * @api public
	     */
	
	    node.Game = require('./Game').Game;

	  }
	  // end node
		
	
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
	
	/**
	 *  Exposing constants
	 */	
	exports.actions = GameMsg.actions;
	exports.IN = GameMsg.IN;
	exports.OUT = GameMsg.OUT;
	exports.targets = GameMsg.targets;		
	exports.states = GameState.iss;
	
	
	// Constructor
	nodeGame.prototype.__proto__ = EventEmitter.prototype;
	nodeGame.prototype.constructor = nodeGame;
	
	function nodeGame() {
		EventEmitter.call(this);
		this.gsc = null;
		this.game = null;
	};
	
	
//	node.memory.get = function (reverse) {
//		return node.game.dump(reverse);
//	}
//
//	node.memory.getValues = function(reverse) {
//		return node.game.memory.getValues(reverse);
//	}
	
	/**
	 * Creating an object
	 */
	var that = node.node = new nodeGame();
	
	node.state = function() {
		return (that.game) ? node.node.game.gameState : false;
	};
	
	node.on = function (event, listener) {
		var state = this.state();
		//node.log(state);
		
		// It is in the init function;
		if (!state || (GameState.compare(state, new GameState(), true) === 0 )) {
			that.addListener(event, listener);
			//node.log('global');
		}
		else {
			that.addLocalListener(event, listener);
			//node.log('local');
		}
	};
	
	node.once = function (event, listener) {
		node.on(event, listener);
		node.on(event, function(event, listener) {
			that.removeListener(event, listener);
		});
	};
	
	node.play = function (conf, game) {	
		node.gsc = that.gsc = new GameSocketClient(conf);
		
		node.game = that.game = new Game(game, that.gsc);
		//node.memory = that.game.memory;
		// INIT the game
		that.game.init.call(that.game);
		that.gsc.setGame(that.game);
		
		node.log('nodeGame: game loaded...');
		node.log('nodeGame: ready.');
	};	
	
	node.observe = function (conf) {	
		node.gsc = that.gsc = new GameSocketClient(conf);
		
		// Retrieve the game and set is as observer
		node.get('GAME', function(game) {
			
			alert(game);
			
//			var game = game.observer = true;
//			node.game = that.game = game;
//			
//			that.game.init();
//			
//			that.gsc.setGame(that.game);
//			
//			node.log('nodeGame: game loaded...');
//			node.log('nodeGame: ready.');
		});
		
	};	
	
	node.fire = node.emit = function (event, p1, p2, p3) {	
		that.emit(event, p1, p2, p3);
	};	
	
	node.say = function (data, what, whom) {
		that.emit('out.say.DATA', data, whom, what);
	};
	
	/**
	 * Set the pair (key,value) into the server
	 * @value can be an object literal.
	 * 
	 * 
	 */
	node.set = function (key, value) {
		// TODO: parameter to say who will get the msg
		that.emit('out.set.DATA', value, null, key);
	}
	
	
	node.get = function (key, func) {
		that.emit('out.get.DATA', key);
		node.once(key, function(data) {
			func.call(node.game,data);
		});
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
		
	
//	this.setSTATE = function(action,state,to){	
//		var stateEvent = GameMsg.OUT + action + '.STATE'; 
//		fire(stateEvent,action,state,to);
//	};
	
	// Receiving
	
	// Say
	
	node.onTXT = function(func) {
		node.on("in.say.TXT", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.onDATA = function(text, func) {
		node.on('in.say.DATA', function(msg) {
			if (text && msg.text === text) {
				func.call(that.game,msg);
			}
		});
		
		node.on('in.set.DATA', function(msg) {
			func.call(that.game,msg);
		});
	};
	
	// Set
	
	node.onSTATE = function(func) {
		node.on("in.set.STATE", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.onPLIST = function(func) {
		node.on("in.set.PLIST", function(msg) {
			func.call(that.game,msg);
		});
		
		node.on("in.say.PLIST", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.DONE = function (text) {
		node.emit("DONE",text);
	};
	
	node.TXT = function (text, to) {
		node.emit('out.say.TXT', text, to);
	};	
	
	node.random = {};
	
	// Generates event at RANDOM timing in milliseconds
	// if timing is missing, default is 6000
	node.random.emit = function (event, timing){
		var timing = timing || 6000;
		setTimeout(function(event) {
			node.emit(event);
		}, Math.random()*timing, event);
	};
	
	node.random.exec = function (func, timing) {
		var timing = timing || 6000;
		setTimeout(function(func) {
			func.call();
		}, Math.random()*timing, func);
	}
	
	node.replay = function (reset) {
		if (reset) node.game.memory.clear(true);
		node.goto(new GameState({state: 1, step: 1, round: 1}));
	}
	
	node.goto = function(state) {
		node.game.updateState(state);
	};
	
	// if node
	if ('object' === typeof module && 'function' === typeof require) {
		
		 /**
	     * Enable file system operations
	     */
	
	    node.csv = {};
	    node.fs = {};
	    
	    var fs = require('fs');
	    var path = require('path');
	    var csv = require('ya-csv');
	    
	    
	    /**
	     * Takes an obj and write it down to a csv file;
	     */
	    node.fs.writeCsv = function (path, obj) {
	    	var writer = csv.createCsvStreamWriter(fs.createWriteStream( path, {'flags': 'a'}));
	    	var i;
	        for (i=0;i<obj.length;i++) {
	    		writer.writeRecord(obj[i]);
	    	}
	    };
	    
	    node.memory.dump = function (path) {
			node.fs.writeCsv(path, node.game.memory.split().fetchValues());
	    }
	  
	}
	// end node
	
	
	
	
})('undefined' != typeof node ? node : module.exports);