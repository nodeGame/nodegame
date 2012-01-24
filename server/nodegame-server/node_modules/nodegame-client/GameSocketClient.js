(function (exports, node, io) {
		
	var GameMsg = node.GameMsg;
	var GameState = node.GameState;
	var Player = node.Player;
	var GameMsgGenerator = node.GameMsgGenerator;
	
	/**
	 * Expose constructor;
	 *
	 */
	exports.GameSocketClient = GameSocketClient;
	
	
	
	function GameSocketClient (options) {
		this.options = options;
		this.name = options.name;
		this.url = options.url;
		
		this.servername = null;
		this.game = null;
		
		this.io = null; // will be created only after the game is loaded;
		this.buffer = [];
	}
	
	GameSocketClient.prototype.setGame = function (game) {
		this.game = game;
		this.connect();
	};
	
	GameSocketClient.prototype.connect = function() {
		// TODO: add check if http:// is already in
		node.log('nodeGame: connecting to ' + this.url);
		this.io = io.connect(this.url, this.options.io);
	    this.attachFirstListeners(this.io);
	    return this.io;
	};
	
	/*
	
	I/O Functions
	
	*/
	
	//Parse the message received in the Socket
	GameSocketClient.prototype.secureParse = function (msg) {
		
		try {
			//node.log(msg);
			//debugger;
			var gameMsg = GameMsg.clone(JSON.parse(msg));
			node.log('R: ' + gameMsg);			
			node.emit('LOG', 'R: ' + gameMsg.toSMS());
			return gameMsg;
		}
		catch(e) {
			var error = "Malformed msg received: " + e;
			node.log(error, 'ERR');
			// TODO: Automatically log errors
			node.emit('LOG', 'E: ' + error);
			return false;
		}
		
	};
		
	GameSocketClient.prototype.clearBuffer = function () {
		
		var nelem = this.buffer.length;
		for (var i=0; i < nelem; i++) {
			var msg = this.buffer.shift();
			node.emit(msg.toInEvent(), msg);
			//node.log('Debuffered ' + msg);
		}
	
	};
	
	/**
	 * Nothing is done until the SERVER send an HI msg. All the others msgs will 
	 * be ignored otherwise.
	 */
	GameSocketClient.prototype.attachFirstListeners = function (socket) {
		
		var that = this;
		
		socket.on('connect', function (msg) {
			var connString = 'nodeGame: connection open';
		    node.log(connString); 
		    
		    socket.on('message', function (msg) {	
		    	
		    	var msg = that.secureParse(msg);
		    	
		    	if (msg) { // Parsing successful
					if (msg.target === 'HI') {
						that.player = new Player({id:msg.data,name:that.name});
						that.servername = msg.from;
						
						// Get Ready to play
						that.attachMsgListeners(socket, msg.session);
						
						// Send own name to SERVER
						that.sendHI(that.player, 'ALL');
						// Ready to play
						node.emit('out.say.HI');
				   	 } 
		    	}
		    });
		    
		});
		
	    socket.on('disconnect', function() {
	    	// TODO: this generates an error: attempt to run compile-and-go script on a cleared scope
	    	node.log('closed');
	    });
	};
	
	GameSocketClient.prototype.attachMsgListeners = function (socket, session) {   
		var that = this;
		
		node.log('nodeGame: Attaching FULL listeners');
		socket.removeAllListeners('message');
			
		this.gmg = new GameMsgGenerator(session, this.player.id, new GameState());
	
		socket.on('message', function(msg) {
			var msg = that.secureParse(msg);
			
			if (msg) { // Parsing successful
				//node.log('GM is: ' + that.game.gameState.is);
				// Wait to fire the msgs if the game state is loading
				if (that.game && that.game.isGameReady()) {
					//node.log('GM is now: ' + that.game.gameState.is);
					
//					var event = msg.toInEvent();
//					
//					
//					if (event !== 'in.say.DATA') {
//						node.emit(event, msg);
//					}
//					else {
//						node.emit('in.' +  msg.action + '.' + msg.text, msg);
//					}
					
					node.emit(msg.toInEvent(), msg);
				}
				else {
					//node.log(that.game.gameState.is + ' < ' + GameState.iss.PLAYING);
					//node.log('Buffering: ' + msg);
					that.buffer.push(msg);
				}
			}
		});
		
		node.emit('NODEGAME_READY');
	};
	
	GameSocketClient.prototype.sendHI = function (state, to) {
		var to = to || 'SERVER';
		var msg = this.gmg.createHI(this.player, to);
		this.game.player = this.player;
		this.send(msg);
	};
	
	// TODO: other things rely on this methods which has changed
	GameSocketClient.prototype.sendSTATE = function(action, state, to) {	
		var msg = this.gmg.createSTATE(action,state,to);
		this.send(msg);
	};
	
	GameSocketClient.prototype.sendTXT = function(text, to) {	
		var msg = this.gmg.createTXT(text,to);
		this.send(msg);
	};
	
	GameSocketClient.prototype.sendDATA = function (action, data, to, msg) {
		var to = to || 'SERVER';
		var msg = msg || 'DATA';
		var msg = this.gmg.createDATA(action, data, to, msg);
		this.send(msg);
	};
	
	/**
	 * Write a msg into the socket. 
	 * 
	 * The msg is actually received by the client itself as well.
	 */
	GameSocketClient.prototype.send = function (msg) {
		
		// TODO: Check Do volatile msgs exist for clients?
		
		//if (msg.reliable) {
			this.io.send(msg.stringify());
		//}
		//else {
		//	this.io.volatile.send(msg.stringify());
		//}
		node.log('S: ' + msg);
		node.emit('LOG', 'S: ' + msg.toSMS());
	};

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
  , 'undefined' != typeof io ? io : module.parent.exports.io
);