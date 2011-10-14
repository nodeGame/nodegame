/*
 * GameSocketClient
 *
 *
 */

function GameSocketClient(options,nodeGame) {
	
	this.name = options.name;
	
	this.host = options.host;
	this.port = options.port;
		
	this.socket = this.connect();
	
	this.game = null;
}

GameSocketClient.prototype.setGame = function(game) {
	this.game = game;
};

GameSocketClient.prototype.connect = function() {
	// TODO: add check if http:// is already in
	var url = "http://" + this.host + ":" + this.port;
	console.log('Connecting to ' + url);
	var socket = io.connect(url);
    this.attachFirstListeners(socket);
    return socket;
};


/*

I/O Functions

*/

//Parse the message newly received in the Socket
GameSocketClient.prototype.secureParse = function (msg) {
	
	var gameMsg = new GameMsg(null); // the newly received msg
	
	try {
		gameMsg.clone(JSON.parse(msg));
		console.log('R ' + gameMsg);
		node.fire('LOG', 'R: ' + gameMsg.toSMS());
	}
	catch(e) {
		var error = "Malformed msg received: " + e;
		node.fire('LOG', 'E: ' + error);
	}
	
	return gameMsg;
};

// TODO CHANGE HERE

// Waiting for HI from Server
GameSocketClient.prototype.attachFirstListeners = function (socket) {
	
	var that = this;
	
	socket.on('connect', function (msg) {
		var connString = 'nodeGame: connection open';
	    console.log(connString); 
	    
	    socket.on('message', function (msg) {	
			
	    	var msg = that.secureParse(msg);
	    	
			if (msg.target === 'HI'){
				that.player = new Player(msg.data,that.name);
				console.log('HI: ' + that.player);
				
				// Get Ready to play
				that.attachMsgListeners(socket, msg.session);
				
				// Send own name to all
				that.sendHI(that.player,'ALL');
				
				// Confirmation of reception was required
//				if (msg.reliable) {
//					that.sendACK(msg);
//				}
		   	 } 
	    });
	    
	});
	
//	socket.on('message', function (msg) {	
//		
//		console.log('msg!2');
//		
//    	var msg = that.secureParse(msg);
//    	
//		if (msg.target === 'HI'){
//			that.player = new Player(msg.data,that.name);
//			console.log('HI: ' + that.player);
//			
//			// Get Ready to play
//			that.attachMsgListeners(socket, msg.session);
//			
//			// Send own name to all
//			that.sendHI(that.player,'ALL');
//			
//			// Confirmation of reception was required
//			if (msg.reliable) {
//				that.sendACK(msg);
//			}
//	   	 } 
//    });
	
    socket.on('disconnect', function() {
    	// TODO: this generates an error: attempt to run compile-and-go script on a cleared scope
    	console.log("closed");
    });
};

// Websocket is waiting for the HI msg from the Server
//GameSocketClient.prototype.attachFirstListeners = function (w) {
//	
//	var that = this;
//	
//    // Registering Event Listeners
//    w.onopen = function() {
//    	var connString = 'nodeGame: connection open';
//        console.log(connString); 
//    };
//
//    w.onmessage = function(e) {
//
//    	var msg = that.secureParse(e);
//    	
//		if (msg.target === 'HI'){
//			that.player = new Player(msg.data,that.name);
//			console.log('HI: ' + that.player);
//			
//			
//			// Get Ready to play
//			that.attachMsgListeners(w,msg.session,this.msgClientListeners);
//			
//			// Send own name to all
//			that.sendHI(that.player,'ALL');
//			
//			// Confirmation of reception was required
//			if (msg.reliable) {
//				that.sendACK(msg);
//			}
//	   	 } 
//    };
//
//    w.onclose = function(e) {
//    	// TODO: this generates an error: attempt to run compile-and-go script on a cleared scope
//    	console.log("closed");
//    };
//};

GameSocketClient.prototype.attachMsgListeners = function(socket, session) {   

	console.log('nodeGame: Attaching FULL listeners');
	socket.removeListener('message',this.socket.onmessage,false);
	
	this.gmg = new GameMsgGenerator(session,this.player.getConnid(),new GameState());

	var that = this;
	socket.on('message', function(msg) {
		
		var msg = that.secureParse(msg);
		node.fire(msg.toInEvent(), msg);
		
		// Confirmation of reception was required
		if (msg.reliable) {
			that.sendACK(msg);
		}
	});
};

// MSGs

GameSocketClient.prototype.sendACK = function (gm,to) {

	//console.log('ACK: ' + gm.data);

	if (to === undefined || to === null) {
		to = 'SERVER';
	}
	var msgACK = this.gmg.createACK(gm,to);	
	//console.log('CREATED ACK: FROM' + msgACK.from + ' TO: ' + msgACK.to);
	this.send(msgACK, to);
};


GameSocketClient.prototype.sendHI = function (state,to) {
	console.log('steeeeeee');
	var to = to || 'SERVER';
	var msg = this.gmg.createHI(this.player);
	this.game.player = this.player;
	this.send(msg, to);
};

// TODO: other things rely on this methods which has changed
GameSocketClient.prototype.sendSTATE = function(action, state,to) {	
	var msg = this.gmg.createSTATE(action,state,to);
	this.send(msg, to);
};

GameSocketClient.prototype.sendTXT = function(text,to) {	
	var msg = this.gmg.createTXT(text,to);
	this.send(msg, to);
};

GameSocketClient.prototype.sendDATA = function (data,to,msg) {
	var to = to || 'SERVER';
	var msg = this.gmg.createDATA(data,to,msg);
	this.send(msg, to);
};

GameSocketClient.prototype.send = function (msg, to) {
	// TODO CHANGE HERE
	this.socket.send(msg.stringify());
	console.log('S: ' + msg);
	node.fire('LOG', 'S: ' + msg.toSMS());
};