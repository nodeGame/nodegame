/*!
 * nodeGame-all v0.4.1
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on So 16. Okt 10:26:50 CEST 2011
 *
 */
 
 
/*!
 * nodeGame Client v0.3
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on So 16. Okt 10:26:50 CEST 2011
 *
 */
 
 
(function( window ) {

  console.log('nodeGame v.0.4.1'); // TODO: Where to save the version number?
  console.log('nodeGame: loading...');
  
// All the Functions

 function EventEmitter(){
    this._listeners = {};
    this._localListeners = {};
}

EventEmitter.prototype = {

    constructor: EventEmitter,

//    on: function(type, listener){
//        if (typeof this._listeners[type] == "undefined"){
//            this._listeners[type] = [];
//        }
//        //console.log('Added Listener: ' + type + ' ' + listener);
//        this._listeners[type].push(listener);
//    },
    
    addListener: function(type,listener) {
    	 if (typeof this._listeners[type] == "undefined"){
             this._listeners[type] = [];
         }
         //console.log('Added Listener: ' + type + ' ' + listener);
         this._listeners[type].push(listener);
    },
    
    addLocalListener: function (type,listener) {
    	if (typeof this._localListeners[type] == "undefined"){
            this._localListeners[type] = [];
        }

        this._localListeners[type].push(listener);
    },

    emit: function(event, p1, p2, p3) { // Up to 3 parameters
    	
    	if (typeof event == "string") {
            event = { type: event };
        }
        if (!event.target){
            event.target = this;
        }
        
        if (!event.type){  //falsy
            throw new Error("Event object missing 'type' property.");
        }
    	// Debug
        //console.log('Fired ' + event.type);
        
        
        //Global Listeners
        if (this._listeners[event.type] instanceof Array) {
            var listeners = this._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                // TODO: Check why fire the event name as well??
            	//listeners[i].call(this, event, p1, p2, p3);
                listeners[i].call(this, p1, p2, p3);
            }
        }
        
        // Local Listeners
        if (this._localListeners[event.type] instanceof Array) {
            var listeners = this._localListeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++) {
                // TODO: Check why fire the event name as well??
            	//listeners[i].call(this, event, p1, p2, p3);
                listeners[i].call(this, p1, p2, p3);
            }
        }
        
    },
    
    // TODO: remove fire when all the code has been updated
    fire: function(event, p1, p2, p3) { // Up to 3 parameters
    	this.emit(event, p1, p2, p3);
    },

    removeListener: function(type, listener) {
    	
    	//console.log('Trying to remove ' + type + ' ' + listener);
    	
        if (this._listeners[type] instanceof Array) {
        	
        	if (listener === null || listener === undefined) {
        		delete this._listeners[type];
        		//console.log('Removed listener ' + type);
        		return true;
        	}
        	
        	
            var listeners = this._listeners[type];
            for (var i=0, len=listeners.length; i < len; i++) {
            	
            	//console.log(listeners[i]);
            	
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    //console.log('Removed listener ' + type + ' ' + listener);
                    return true;
                }
            }
        }
        
        return false; // no listener removed
    },
    
    clearLocalListeners: function() {
    	console.log('Cleaning Local Listeners');
    	for (var key in this._localListeners) {
    		if (this._localListeners.hasOwnProperty(key)) {
    			this.removeListener(key, this._localListeners[key]);
    		}
    	}
    	
    	this._localListeners = {};
    },
    
    // Debug
    printAllListeners: function() {
    	console.log('nodeGame:\tPRINTING ALL LISTENERS');
	    
    	for (var i in this._listeners){
	    	if (this._listeners.hasOwnProperty(i)){
	    		console.log(i + ' ' + i.length);
	    	}
	    }
    	
    	for (var i in this._localListeners){
	    	if (this._listeners.hasOwnProperty(i)){
	    		console.log(i + ' ' + i.length);
	    	}
	    }
        
    }
};
 
 
/*
 * Game
 *
 */

function Game (settings,gamesocketclient) {
	
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
			node.gsc.sendSTATE('set',state,to);
		});		
	
		// SAY
		
		node.on( OUT + say + 'STATE', function(state,to){
			//console.log('BBBB' + p + ' ' + args[0] + ' ' + args[1] + ' ' + args[2]);
			node.gsc.sendSTATE('say',state,to);
		});	
		
		node.on( OUT + say + 'TXT', function(text,to){
			node.gsc.sendTXT(text,to);
		});
		
		node.on( OUT + say + 'DATA', function(data,to,msg){
			node.gsc.sendDATA(data,to,msg);
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
	this.gsc.gmg.setCurrentState(this.gameState);
	// Important: SAY
	//this.STATE(GameMsg.actions.SAY,this.gameState, 'ALL');
	var stateEvent = GameMsg.OUT + GameMsg.actions.SAY + '.STATE'; 
	node.fire(stateEvent,this.gameState,'ALL');
	console.log('I: New State = ' + this.gameState);
};

Game.prototype.updateState = function(state) {
	
	console.log('New state is going to be ' + state);
	
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
	var gameState = new GameState(nextState,nextStep,nextRound);
	if (this.gameLoop.exist(gameState)) {			
		this.gameState = gameState;
		
		// Local Listeners from previous state are erased before proceeding
		// to next one
		node.clearLocalListeners();
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
 
/*
 * GameLoop
 * 
 * Handle the states of the game
 * 
 */

function GameLoop (loop) {
	this.loop = loop;
	
	this.limits = Array();
	
	for (var key in this.loop) {
		if (this.loop.hasOwnProperty(key)) {
			var round = loop[key].rounds || 1;
			this.limits.push({rounds:round,steps:Utils.getListSize(this.loop[key]['loop'])});
		}
	}
	
	this.nStates = this.limits.length;
	
}


GameLoop.prototype.exist = function (gameState) {

	if (typeof(this.loop[gameState.state]) === 'undefined') {
		console.log('(E): Unexisting state: ' + gameState.state);
		return false;
	}
	
	if (typeof(this.loop[gameState.state]['loop'][gameState.step]) === 'undefined'){
		console.log('(E): Unexisting step: ' + gameState.step);
		return false;
	}
	// States are 1 based, arrays are 0-based => -1
	if(gameState.round > this.limits[gameState.state-1]['rounds']) {
		console.log('(E): Unexisting round: ' + gameState.round + 'Max round: ' + this.limits[gameState.state]['rounds']);
		return false;
	}
	
		
	return true;
};
		
GameLoop.prototype.next = function (gameState) {
	
	console.log('NEXT OF THIS ' + gameState);
	//console.log(this.limits);
	
	// Game has not started yet, do it!
	if (gameState.state === 0) {
		console.log('NEXT: NEW');
		return new GameState(1,1,1);
	}
	
	if (!this.exist(gameState)) {
		console.log('No next state of non-existing state: ' + gameState);
	}
	
	var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
	
	if (this.limits[idxLimit]['steps'] > gameState.step){
		var newStep = Number(gameState.step)+1;
		console.log('Limit: ' + this.limits[gameState.state]['steps']);
		console.log('NEXT STEP: '  + new GameState(gameState.state,newStep,gameState.round));
		return new GameState(gameState.state,gameState.step+1,gameState.round);
	}
	
	if (this.limits[idxLimit]['rounds'] > gameState.round){
		var newRound = Number(gameState.round)+1;
		console.log('NEXT ROUND: ' + new GameState(gameState.state,1,newRound));
		return new GameState(gameState.state,1,newRound);
	}
	
	if (this.nStates > gameState.state){		
		var newState = Number(gameState.state)+1;
		console.log('NEXT STATE: ' + new GameState(newState,1,1));
		return new GameState(newState,1,1);
	}
	
	return false; // game over
};

GameLoop.prototype.previous = function (gameState) {
	
	if (!this.exist(gameState)) {
		console.log('No previous state of non-existing state: ' + gameState);
	}
	
	var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
	
	if (gameState.step > 1){
		var oldStep = Number(gameState.step)-1;
		return new GameState(gameState.state,oldStep,gameState.round);
	}
	else if (gameState.round > 1){
		var oldRound = Number(gameState.round)-1;
		var oldStep = this.limits[idxLimit]['steps'];
		return new GameState(gameState.state,oldStep,oldRound);
	}
	else if (gameState.state > 1){
		var oldRound = this.limits[idxLimit-1]['rounds'];
		var oldStep = this.limits[idxLimit-1]['steps'];
		var oldState = idxLimit;
		return new GameState(oldState,oldStep,oldRound);
	}
	
	return false; // game init
};

GameLoop.prototype.getFunction = function(gameState) {
	return this.loop[gameState.state]['loop'][gameState.step];
}; 
 
/*
 * GameMsgGenerator
 * 
 * 
 * All message are reliable, but TXT messages.
 * 
 */

function GameMsgGenerator (session, sender, state) {	
	this.session = session;
	this.sender = sender;
	this.state = state;
};

//GameMsgGenerator.prototype.setCurrentState = function (state) {
//	this.state = state;
//};
//
//GameMsgGenerator.prototype.getCurrentState = function () {
//	return this.state;
//};


// HI

//Notice: this is different from the server;
GameMsgGenerator.prototype.createHI = function(player,to,reliable) {

  var rel = reliable || 1;
  
  return new GameMsg( {
            			session: this.session,
            			state: this.state,
            			action: GameMsg.actions.SAY,
            			target: GameMsg.targets.HI,
            			from: this.sender,
            			to: to,
            			text: Player.parse(player) + ' ready.',
            			data: player,
            			priority: null,
            			reliable: rel
  });


};

// STATE

GameMsgGenerator.prototype.saySTATE = function (plist, to, reliable) {
	return this.createSTATE(GameMsg.SAY, plist, to,reliable);
};

GameMsgGenerator.prototype.setSTATE = function (plist, to, reliable) {
	return this.createSTATE(GameMsg.SET, plist, to,reliable);
};

GameMsgGenerator.prototype.getSTATE = function (plist, to, reliable) {
	return this.createSTATE(GameMsg.GET, plist, to,reliable);
};

GameMsgGenerator.prototype.createSTATE = function (action, state, to, reliable) {
	
	var rel = reliable || 1;
	
	
	return new GameMsg({
						session: this.session,
						state: this.state,
						action: action,
						target: GameMsg.targets.STATE,
						from: this.sender,
						to: to,
						text: 'New State: ' + GameState.stringify(state),
						data: state,
						priority: null,
						reliable: rel
	});
};


// PLIST

GameMsgGenerator.prototype.sayPLIST = function (plist, to, reliable) {
	return this.createPLIST(GameMsg.SAY, plist, to,reliable);
};

GameMsgGenerator.prototype.setPLIST = function (plist, to, reliable) {
	return this.createPLIST(GameMsg.SET, plist, to,reliable);
};

GameMsgGenerator.prototype.getPLIST = function (plist, to, reliable) {
	return this.createPLIST(GameMsg.GET, plist, to, reliable);
};

GameMsgGenerator.prototype.createPLIST = function (action, plist, to, reliable) {
	
	//console.log('Creating plist msg ' + plist + ' ' + plist.size());
	
	var rel = reliable || 1;
	
	return new GameMsg({
						session: this.session, 
						state: this.state,
						action: action,
						target: GameMsg.targets.PLIST,
						from: this.sender,
						to: to,
						text: 'List of Players: ' + plist.size(),
						data: plist.pl,
						priority: null,
						reliable: rel
	});
};


//MSG

GameMsgGenerator.prototype.createTXT = function (text, to, reliable) {
	
	//console.log("STE: " + text);
	
	var rel = reliable || 0;
	
	return new GameMsg({
						session: this.session,
						state: this.state,
						action: GameMsg.actions.SAY,
						target: GameMsg.targets.TXT,
						from: this.sender,
						to: to,
						text: text,
						data: null,
						priority: null,
						reliable: rel
	});
	
	
};


// DATA

GameMsgGenerator.prototype.createDATA = function (data, to, text, reliable) {
	
	var rel = reliable || 1;
	var text = text || 'data';
	
	return new GameMsg({
						session: this.session, 
						state: this.state,
						action: GameMsg.actions.SAY,
						target: GameMsg.targets.DATA,
						from: this.sender,
						to: to,
						text: text,
						data: data,
						priority: null,
						reliable: rel
	});
};


// ACK

GameMsgGenerator.prototype.createACK = function (gm, to, reliable) {
	
	var rel = reliable || 0;
	
	var newgm = new GameMsg({
							session: this.session, 
							state: this.state,
							action: GameMsg.actions.SAY,
							target: GameMsg.targets.ACK,
							from: this.sender,
							to: to,
							text: 'Msg ' + gm.id + ' correctly received',
							data: gm.id,
							priority: null,
							reliable: rel
	});
	
	if (gm.forward) {
		newgm.forward = 1;
	}
	
	return newgm;
};  
 
/*
 * JSON Data Format for nodeGame Apps.
 */
GameMsg.actions = {};
GameMsg.targets = {};

GameMsg.actions.SET 	= 'set'; 	// Changes properties of the receiver
GameMsg.actions.GET 	= 'get'; 	// Ask a properties of the receiver
GameMsg.actions.SAY		= 'say'; 	// Announce properties of the sender

GameMsg.targets.HI		= 'HI';		// Introduction
GameMsg.targets.STATE	= 'STATE';	// STATE
GameMsg.targets.PLIST 	= 'PLIST';	// PLIST
GameMsg.targets.TXT 	= 'TXT';	// Text msg
GameMsg.targets.DATA	= 'DATA';	// Contains a data-structure in the data field

GameMsg.targets.ACK		= 'ACK';	// A reliable msg was received correctly

GameMsg.targets.WARN 	= 'WARN';	// To do.
GameMsg.targets.ERR		= 'ERR';	// To do.

GameMsg.IN				= 'in.';	// Prefix for incoming msgs
GameMsg.OUT				= 'out.';	// Prefix for outgoing msgs
		

function GameMsg (gm) {

	this.id = Math.floor(Math.random()*1000000);
	
	this.session = gm.session;
	this.state = gm.state;
	this.target = gm.target; // was action
	this.from = gm.from;
	this.to = gm.to;
	this.text = gm.text;
	this.action = gm.action; 
	this.data = gm.data;
	this.priority = gm.priority;
	this.reliable = gm.reliable;
	
	this.created = Utils.getDate();
	this.forward = 0; // is this msg just a forward?	
};

//function GameMsg (session, currentState, action, target, from, to, text, data,
//					priority, reliable) {
//		
//	this.id = Math.floor(Math.random()*1000000);
//
//	this.action = action; 
//	this.target = target;
//	
//	this.session = session;
//	this.currentState = currentState;
//	
//	this.from = from;
//	this.to = to;
//	this.text = text;
//	this.data = data;
//	
//	this.priority = priority;
//	this.reliable = reliable;
//
//	this.created = Utils.getDate();
//	this.forward = 0; // is this msg just a forward?	
//	
//};
//
//// Does not change the msg ID
//GameMsg.prototype.import = function(jsonMsg) {
//	
//	this.session = jsonMsg.session;
//	this.currentState = jsonMsg.currentState;
//	this.target = jsonMsg.target; // was action
//	this.from = jsonMsg.from;
//	this.to = jsonMsg.to;
//	this.text = jsonMsg.text;
//	this.action = jsonMsg.action; 
//	this.data = jsonMsg.data;
//	this.priority = jsonMsg.priority;
//	this.reliable = jsonMsg.reliable;
//	this.forward = jsonMsg.forward;
//	
//};

// Copy everything
GameMsg.clone = function (gameMsg) {
	
	var gm = new GameMsg(gameMsg);
	
	gm.id = gameMsg.id;
	gm.forward = gameMsg.forward;
	// TODO: Check also created ?
	gm.created = gameMsg.created;
	
	return gm;
};

// Copy everything
//GameMsg.prototype.clone = function(jsonMsg) {
//	
//	this.import(jsonMsg);
//	this.id = jsonMsg.id;
//};

GameMsg.prototype.stringify = function() {
	return JSON.stringify(this);
};

GameMsg.prototype.toString = function() {
	
	var SPT = ",\t";
	var SPTend = "\n";
	var DLM = "\"";
	
	var gm = new GameState();
	gm.import(this.state);
	
	var line = this.created + SPT;
		line += this.id + SPT;
		line += this.session + SPT;
		line += this.action + SPT;
		line += this.target + SPT;
		line +=	this.from + SPT;
		line += this.to + SPT;
		line += DLM + this.text + DLM + SPT;
		line += DLM + this.data + DLM + SPT; // maybe to remove
		line += this.reliable + SPT;
		line += this.priority + SPTend;
		
		
	return line;
	
};

GameMsg.prototype.toSMS = function () {
	
	var parseDate = /\w+/; // Select the second word;
	var results = parseDate.exec(this.created);
	//var d = new Date(this.created);
	//var line = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
	//var line = results[0];
	var line = '[' + this.from + ']->[' + this.to + ']\t';
	line += '|' + this.action + '.' + this.target + '|'+ '\t';
	line += ' ' + this.text + ' ';
	
	return line;
};

//GameMsg.parse = function(msg) {
//	try {
//		var gm = new GameMsg();
//		gm.import(msg);
//		return gm;
//	}
//	catch(e){
//		throw 'Error while trying to parse GameMsg ' + e.message;
//	}
//};

GameMsg.prototype.toInEvent = function() {
	return 'in.' + this.toEvent();
};

GameMsg.prototype.toOutEvent = function() {
	return 'out.' + this.toEvent();
};

GameMsg.prototype.toEvent = function () {
	return this.action + '.' + this.target;
};  
 
/*
 *
 *
 */

function GameSocketClient(options,nodeGame) {
	
	this.name = options.name;
	
	this.host = options.host;
	this.port = options.port;
	this.servername = null;
	
	this.socket = this.connect();
	
	this.game = null;
}

GameSocketClient.prototype.setGame = function(game) {
	this.game = game;
};

GameSocketClient.prototype.connect = function() {
	// TODO: add check if http:// is already in
	var url = "http://" + this.host + ":" + this.port;
	console.log('nodeGame: connecting to ' + url);
	var socket = io.connect(url);
    this.attachFirstListeners(socket);
    return socket;
};


/*

I/O Functions

*/

//Parse the message received in the Socket
GameSocketClient.prototype.secureParse = function (msg) {
	
	try {
		var gameMsg = GameMsg.clone(JSON.parse(msg));
		console.log('R: ' + gameMsg);
		node.fire('LOG', 'R: ' + gameMsg.toSMS());
		return gameMsg;
	}
	catch(e) {
		var error = "Malformed msg received: " + e;
		node.fire('LOG', 'E: ' + error);
		return false;
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
	    console.log(connString); 
	    
	    socket.on('message', function (msg) {	
			
	    	var msg = that.secureParse(msg);
	    	
	    	if (msg) { // Parsing successful
				if (msg.target === 'HI') {
					that.player = new Player(msg.data,that.name);
					that.servername = msg.from;
					
					// Get Ready to play
					that.attachMsgListeners(socket, msg.session);
					
					// Send own name to SERVER
					that.sendHI(that.player);
			   	 } 
	    	}
	    });
	    
	});
	
    socket.on('disconnect', function() {
    	// TODO: this generates an error: attempt to run compile-and-go script on a cleared scope
    	console.log('closed');
    });
};

GameSocketClient.prototype.attachMsgListeners = function (socket, session) {   
	var that = this;
	
	console.log('nodeGame: Attaching FULL listeners');
	socket.removeAllListeners('message');
		
	this.gmg = new GameMsgGenerator(session,this.player.getId(),new GameState());

	socket.on('message', function(msg) {
		var msg = that.secureParse(msg);
		
		if (msg) { // Parsing successful
			node.fire(msg.toInEvent(), msg);
		}
	});
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

GameSocketClient.prototype.sendDATA = function (data, to, msg) {
	var to = to || 'SERVER';
	var msg = this.gmg.createDATA(data,to,msg);
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
		this.socket.send(msg.stringify());
	//}
	//else {
	//	this.socket.volatile.send(msg.stringify());
	//}
	console.log('S: ' + msg);
	node.fire('LOG', 'S: ' + msg.toSMS());
}; 
 
/*
 * GameState
 * 
 * Representation of a state of the game
 * 
 */

GameState.iss = {};

GameState.iss.UNKNOWN = 0;
GameState.iss.STARTING = 10;
GameState.iss.PLAYING = 50;
GameState.iss.DONE = 100;

function GameState (state,step,round) {
	
	// TODO: add checkings
	this.state = state || 0;
	this.step = step || 0;
	this.round = round || 0;
	
	this.is = GameState.iss.UNKNOWN;

	this.paused = false;
}
 
GameState.prototype.import = function (gamestate) {
	this.state = gamestate.state;
	this.step = gamestate.step;
	this.round = gamestate.round;
	this.is = gamestate.is;
	this.paused = gamestate.paused;
};

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

GameState.parse = function(gamestate) {
	try {
		var gs = new GameState();
		gs.import(gamestate);
		return gs;
	}
	catch(e){
		throw 'Error while trying to parsing GameState ' + e.message;
	}
};

GameState.stringify = function (gs) {
	return gs.state + '.' + gs.step + ':' + gs.round + '_' + gs.is;
};  
 
/*!
 * nodeGame
 */

nodeGame.prototype = new EventEmitter();
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
	EventEmitter.call(this);

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
	
	this.DONE = function (text) {
		node.fire("DONE",text);
	};
	
	this.TXT = function (text, to) {
		node.fire('out.say.TXT', text, to);
	};
	
}; 
 
/*
 * Holds information about the list of players.
 *
 */


function PlayerList(list) {
	
	this.pl = list || {};
	
	this.size = function() {
		return Utils.getListSize(this.pl);
	};
	
//	console.log('This is the size ' + this.size());

}

//PlayerList.prototype.importIDS = function(listIDS) {
//
//var PREFIX = 'P_';
//var i= this.size();
//for (var key in listIDS) {
//    if (listIDS.hasOwnProperty(key)) {
//    	this.add(listIDS[key],'P_' + ++i);
//    }
//}
//};

PlayerList.prototype.importIDS = function(arrayIDS) {

	var PREFIX = 'P_';
	var i = this.size();
	var j = 0;
	for (;j<arrayIDS.length;j++){
		this.add(arrayIDS[j],'P_' + ++i);
	}
};


// Check Here!!! 

PlayerList.prototype.addPlayer = function (player) {
	return this.add(player.id, player.name);
};

PlayerList.prototype.add = function (connid,name) {	
	// Check if the id is unique
	if (typeof(this.pl[connid]) === 'undefined') {
		this.pl[connid] = new Player(connid,name);
		console.log('Added Player ' + this.pl[connid]);
		return true;
	}
		
	console.log('E: Attempt to add a new player already in the player list' + this.pl.id);//[connid]);
	return false;
};

PlayerList.prototype.remove = function (connid) {	
	// Check if the id exists
	if (typeof(this.pl[connid]) !== 'undefined') {
		delete this.pl[connid];
		return true;
	}
	
	console.log('E: Attempt to remove a non-existing player from the the player list');
	return false;
};

PlayerList.prototype.get = function (connid) {	
	// Check if the id exists
	if (typeof(this.pl[connid]) !== 'undefined') {
		return this.pl[connid];
	}
	
	console.log('W: Attempt to access a non-existing player from the the player list ' + player.connid);
	return false;
};

PlayerList.prototype.pop = function (connid) {	
	var p = this.get(connid);
	this.remove(connid);
	return p;
};

PlayerList.prototype.getRandom = function () {	
	return this.toArray()[Math.floor(Math.random()*(this.size()))];
};


PlayerList.prototype.getAllIDs = function () {	
	
     return this.map(function(o){
    	 return o.getId();
     	});
//     
//	 var result = new Array();
//	 
//	 for (var key in this.pl) {
//		 if (this.pl.hasOwnProperty(key)) {
//			 result.push(key);
//		 }
//	  }
//
//	  return result;
};


PlayerList.prototype.updatePlayer = function (player) {
	
	if (typeof(this.pl[player.id]) !== 'undefined') {
		this.pl[connid] = player;
		return true;
	}
	
	console.log('W: Attempt to access a non-existing player from the the player list ' + player.id);
	return false;
};

// Returns an array of array of n groups of players {connid: name}
//The last group could have less elements.
PlayerList.prototype.getNGroups = function (n) {
	
	var copy = this.toArray();
	var nPlayers = copy.length;
	
	var gSize = Math.floor( nPlayers / n);
	var inGroupCount = 0;
	
	var result = new Array();
	
	// Init values for the loop algorithm
	var i;
	var idx;
	var gid = -1;
	var count = gSize +1; // immediately creates a new group in the loop
	for (i=0;i<nPlayers;i++){
		
		// Prepare the array container for the elements of the new group
		if (count >= gSize) {
			gid++;
			result[gid] = new PlayerList();
			count = 0;
		}
		
		// Get a random idx between 0 and array length
		idx = Math.floor(Math.random()*copy.length);
		
		result[gid].add(copy[idx].id,copy[idx].name);
		copy.splice(idx,1);
		count++;
	}
	
	return result;
};

// Returns an array of array of groups of n players {connid: name};
// The last group could have less elements.
PlayerList.prototype.getGroupsSizeN = function (n) {
	// TODO: getGroupsSizeN
};

// TODO: improve
//Returns true if all the players are on the same gameState = gameState
//and they are all GameState = DONE.
PlayerList.prototype.isStateDone = function(gameState) {
	
	var result = this.map(function(p){
		var gs = GameState.parse(p.state);
		
		//console.log('Going to compare ' + gs + ' and ' + gameState);
		
		// Player is done for his state
		if (p.state.is !== GameState.iss.DONE) {
			return 0;
		}
		// The state of the player is actually the one we are interested in
		if (GameState.compare(gameState, p.state, false) !== 0) {
			return 0;
		}
		
		return 1;
	});
	
	var i;
	var sum = 0;
	for (i=0; i<result.length;i++) {
		sum = sum + Number(result[i]);
	}
	return (sum === this.size()) ? true : false;
	
};


PlayerList.prototype.toArray = function () {

	var result = Array();
	
	for (var key in this.pl) {
	    if (this.pl.hasOwnProperty(key)) {
	    	result.push(this.pl[key]);
	    }
	}
	return result;
	return result.sort();
	
};

PlayerList.prototype.forEach = function(callback, thisArg) {
	  
	for (var key in this.pl) {
	    if (this.pl.hasOwnProperty(key)) {
	    	callback.call(thisArg, this.pl[key]);
	    }
	  }
};

PlayerList.prototype.map = function(callback, thisArg) {
	 
	 var result = new Array();
	 
	 for (var key in this.pl) {
		 if (this.pl.hasOwnProperty(key)) {
			 result.push(callback.call(thisArg, this.pl[key]));
		 }
	  }

	  return result;
};


PlayerList.prototype.toString = function (eol) {
	
	var out = '';
	var EOL = eol || '\n';
	
	for (var key in this.pl) {
	    if (this.pl.hasOwnProperty(key)) {
	    	out += key + ': ' + this.pl[key].name;
	    	var state = new GameState();
	    	state.import(this.pl[key].state);
	    	//console.log('STATE: ' + this.pl[key].state.state);
	    	
	    	out += ': ' + state + EOL;
	    }
	}
	
	return out;
	
};

//Player

function Player(id, name, state) {
	
	// PRIVATE variables
	this.id = id;
	this.name = name;
	this.state = state || new GameState();
}

Player.prototype.getId = function() {
	return this.id;
};

Player.prototype.getName = function() {
	return this.name;
};

Player.prototype.import = function (player) {
	this.id = player.id;
	this.name = player.name;
	this.state = player.state;
};

Player.prototype.updateState = function (state) {
	this.state = player.state;
};

Player.parse = function(player) {
	try {
		var p = new Player();
		p.import(player);
		return p;
	}
	catch(e){
		throw 'Error while trying to parse Player ' + e.message;
	}
};

Player.prototype.toString = function() {
	var out = this.getName() + ' (' + this.getId() + ') ' + GameState.parse(this.state);
	return out;
}; 
 
function Utils(){}

Utils.getDate = function() {
	var d = new Date();
	var date = d.getUTCDate() + '-' + (d.getUTCMonth()+1) + '-' + d.getUTCFullYear() + ' ' 
			+ d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' ' 
			+ d.getMilliseconds();
	
	return date;
};

Utils.getTime = function() {
	var d = new Date();
	var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
	
	return time;
};

Utils.getListSize = function (list) {	
	var n = 0;
	for (var key in list) {
	    if (list.hasOwnProperty(key)) {
	    	n++;
	    }
	}
	
	//console.log('Calculated list length ' + n);
	
	return n;
};

//TODO: Improve
Utils.print_r = function (array) {
	for (var i=0,len=array.length;i<len;i++){
		var el = array[i]; 
		if (typeof(el) === 'Array'){
			Utils.print_r(el);
		}
		else {
			if (typeof(el) === 'Object'){
				for (var key in el) {
					if (el.hasOwnProperty(key)){
						console.log(key + ' ->\n');
						Utils.print_r(el[key]);
					}
				}
			}
			else {
				console.log(el);
			}
		}
	}
};

 
 

//Expose nodeGame and Utils to the global object
window.nodeGame = window.node = new nodeGame();
window.Utils = Utils;


})(window); 
 
 
 
/*!
 * nodeGadgets v0.3.1
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on So 16. Okt 10:26:50 CEST 2011
 *
 */
 
 
// TODO: hide helping classes

/*!
 * ChernoffFaces
 * 
 * Parametrically display Chernoff Faces
 * 
 */

ChernoffFaces.defaults = {};
ChernoffFaces.defaults.canvas = {};
ChernoffFaces.defaults.canvas.width = 100;
ChernoffFaces.defaults.canvas.heigth = 100;

function ChernoffFaces(id, dims) {
	
	this.game = nodeGame.game;
	this.id = id || 'ChernoffFaces';
	this.name = 'Chernoff Faces';
	this.version = '0.1';
	
	this.bar = null;
	this.root = null;
	
	this.recipient = null;
	
	this.dims = {
				width: (dims) ? dims.width : ChernoffFaces.defaults.canvas.width, 
				height:(dims) ? dims.height : ChernoffFaces.defaults.canvas.heigth
	};
};

ChernoffFaces.prototype.append = function (root, ids) {
	
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idCanvas = PREF + 'canvas';
	var idButton = PREF + 'button';

	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('canvas')) idCanvas = ids.canvas;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
	}
	
	var fieldset = nodeWindow.addFieldset(root, idFieldset, 'Chernoff Box', {style: 'float:left'});
	
	var canvas = nodeWindow.addCanvas(root, idCanvas, this.dims);
	
	var fp = new FacePainter(canvas);
	var fv = new FaceVector();
	
	fp.draw(fv);
	
	var button = nodeWindow.addButton(fieldset,idButton);
									
	// Add Gadget
	var sc = new SliderControls('cf_controls',FaceVector.defaults);
	nodeWindow.addGadget(fieldset,sc);
	
	var that = this;

	button.onclick = function() {		
		var fv = sc.getAllValues();
		console.log(fv);
		var fv = new FaceVector(fv);
		console.log(fv);
		fp.redraw(fv);
	};
	
	return fieldset;
	
};

ChernoffFaces.prototype.listeners = function () {
	var that = this;
//	
//	node.on( 'input', function(msg) {
//			var fv = new FaceVector(sc.getAllValues());
//			fp.redraw(fv);
//		}); 
};


/*!
* ChernoffFaces
* 
* Parametrically display Chernoff Faces
* 
*/

function FacePainter (canvas, settings) {
		
	this.canvas = nodeWindow.create.Canvas(canvas);
	
	this.scaleX = canvas.width / ChernoffFaces.defaults.canvas.width;
	this.scaleY = canvas.height / ChernoffFaces.defaults.canvas.heigth;
};

//Draws a Chernoff face.
FacePainter.prototype.draw = function (face, x, y) {
			
	this.fit2Canvas(face);
	this.canvas.scale(face.scaleX, face.scaleY);
	
	console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );
	
	var x = x || this.canvas.centerX;
	var y = y || this.canvas.centerY;
	
	this.drawHead(face, x, y);
		
	this.drawEyes(face, x, y);

	this.drawPupils(face, x, y);

	this.drawEyebrow(face, x, y);

	this.drawNose(face, x, y);
	
	this.drawMouth(face, x, y);
	
};		
	
FacePainter.prototype.redraw = function (face, x, y) {
	this.canvas.clear();
	this.draw(face,x,y);
}

FacePainter.prototype.scale = function (x, y) {
	this.canvas.scale(this.scaleX, this.scaleY);
}

// TODO: Improve. It eats a bit of the margins
FacePainter.prototype.fit2Canvas = function(face) {
	if (!this.canvas) {
		console.log('No canvas found');
		return;
	}
	
	if (this.canvas.width > this.canvas.height) {
		var ratio = this.canvas.width / face.head_radius * face.head_scale_x;
	}
	else {
		var ratio = this.canvas.height / face.head_radius * face.head_scale_y;
	}
	
	face.scaleX = ratio / 2;
	face.scaleY = ratio / 2;
}

FacePainter.prototype.drawHead = function (face, x, y) {
	
	var radius = face.head_radius;
	
	this.canvas.drawOval({
				   x: x, 
				   y: y,
				   radius: radius,
				   scale_x: face.head_scale_x,
				   scale_y: face.head_scale_y,
				   color: face.color,
				   lineWidth: face.lineWidth
	});
};

FacePainter.prototype.drawEyes = function (face, x, y) {
	
	var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
	var spacing = face.eye_spacing;
		
	var radius = face.eye_radius;
	//console.log(face);
	this.canvas.drawOval({
					x: x - spacing,
					y: height,
					radius: radius,
					scale_x: face.eye_scale_x,
					scale_y: face.eye_scale_y,
					color: face.color,
					lineWidth: face.lineWidth
					
	});
	//console.log(face);
	this.canvas.drawOval({
					x: x + spacing,
					y: height,
					radius: radius,
					scale_x: face.eye_scale_x,
					scale_y: face.eye_scale_y,
					color: face.color,
					lineWidth: face.lineWidth
	});
}

FacePainter.prototype.drawPupils = function (face, x, y) {
		
	var radius = face.pupil_radius;
	var spacing = face.eye_spacing;
	var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
	
	this.canvas.drawOval({
					x: x - spacing,
					y: height,
					radius: radius,
					scale_x: face.pupil_scale_x,
					scale_y: face.pupil_scale_y,
					color: face.color,
					lineWidth: face.lineWidth
	});
	
	this.canvas.drawOval({
					x: x + spacing,
					y: height,
					radius: radius,
					scale_x: face.pupil_scale_x,
					scale_y: face.pupil_scale_y,
					color: face.color,
					lineWidth: face.lineWidth
	});

};

FacePainter.prototype.drawEyebrow = function (face, x, y) {
	
	var height = FacePainter.computeEyebrowOffset(face,y);
	var spacing = face.eyebrow_spacing;
	var length = face.eyebrow_length;
	var angle = face.eyebrow_angle;
	
	this.canvas.drawLine({
					x: x - spacing,
					y: height,
					length: length,
					angle: angle,
					color: face.color,
					lineWidth: face.lineWidth
				
					
	});
	
	this.canvas.drawLine({
					x: x + spacing,
					y: height,
					length: 0-length,
					angle: -angle,	
					color: face.color,
					lineWidth: face.lineWidth
	});
	
};

FacePainter.prototype.drawNose = function (face, x, y) {
	
	var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
	var nastril_r_x = x + face.nose_width / 2;
	var nastril_r_y = height + face.nose_length;
	var nastril_l_x = nastril_r_x - face.nose_width;
	var nastril_l_y = nastril_r_y; 
	
	this.canvas.ctx.lineWidth = face.lineWidth;
	this.canvas.ctx.strokeStyle = face.color;
	
	this.canvas.ctx.save();
	this.canvas.ctx.beginPath();
	this.canvas.ctx.moveTo(x,height);
	this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
	this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
	//this.canvas.ctx.closePath();
	this.canvas.ctx.stroke();
	this.canvas.ctx.restore();

};
		
FacePainter.prototype.drawMouth = function (face, x, y) {
	
	var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
	var startX = x - face.mouth_width / 2;
    var endX = x + face.mouth_width / 2;
	
	var top_y = height - face.mouth_top_y;
	var bottom_y = height + face.mouth_bottom_y;
	
	// Upper Lip
	this.canvas.ctx.moveTo(startX,height);
    this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
    this.canvas.ctx.stroke();
	
    //Lower Lip
    this.canvas.ctx.moveTo(startX,height);
    this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
    this.canvas.ctx.stroke();
   
};	


//TODO Scaling ?
FacePainter.computeFaceOffset = function (face, offset, y) {
	var y = y || 0;
	//var pos = y - face.head_radius * face.scaleY + face.head_radius * face.scaleY * 2 * offset;
	var pos = y - face.head_radius + face.head_radius * 2 * offset;
	//console.log('POS: ' + pos);
	return pos;
};

FacePainter.computeEyebrowOffset = function (face, y) {
	var y = y || 0;
	var eyemindistance = 2;
	return FacePainter.computeFaceOffset(face, face.eye_height, y) - eyemindistance - face.eyebrow_eyedistance;
};


/*!
* 
* A description of a Chernoff Face.
*
* This class packages the 11-dimensional vector of numbers from 0 through 1 that completely
* describe a Chernoff face.  
*
*/

//FaceVector.defaults = {
//		// Head
//		head_radius: {
//			// id can be specified otherwise is taken head_radius
//			min: 10,
//			max: 100,
//			step: 0.01,
//			value: 30,
//			label: 'Face radius'
//		},
//		head_scale_x: {
//			min: 0.2,
//			max: 2,
//			step: 0.1,
//			value: 0.5,
//			label: 'Scale head horizontally'
//		},
//		head_scale_y: {
//			min: 0.2,
//			max: 2,
//			step: 0.1,
//			value: 1,
//			label: 'Scale head vertically'
//		},
//		// Eye
//		eye_height: {
//			min: 0.1,
//			max: 0.9,
//			step: 0.1,
//			value: 0.4,
//			label: 'Eye height'
//		},
//		eye_radius: {
//			min: 2,
//			max: 30,
//			step: 1,
//			value: 5,
//			label: 'Eye radius'
//		},
//		eye_spacing: {
//			min: 0,
//			max: 50,
//			step: 2,
//			value: 10,
//			label: 'Eye spacing'
//		},
//		eye_scale_x: {
//			min: 0.2,
//			max: 2,
//			step: 0.2,
//			value: 1,
//			label: 'Scale eyes horizontally'
//		},
//		eye_scale_y: {
//			min: 0.2,
//			max: 2,
//			step: 0.2,
//			value: 1,
//			label: 'Scale eyes vertically'
//		},
//		// Pupil
//		pupil_radius: {
//			min: 1,
//			max: 9,
//			step: 1,
//			value: 1,  //this.eye_radius;
//			label: 'Pupil radius'
//		},
//		pupil_scale_x: {
//			min: 0.2,
//			max: 2,
//			step: 0.2,
//			value: 1,
//			label: 'Scale pupils horizontally'
//		},
//		pupil_scale_y: {
//			min: 0.2,
//			max: 2,
//			step: 0.2,
//			value: 1,
//			label: 'Scale pupils vertically'
//		},
//		// Eyebrow
//		eyebrow_length: {
//			min: 1,
//			max: 30,
//			step: 1,
//			value: 10,
//			label: 'Eyebrow length'
//		},
//		eyebrow_eyedistance: {
//			min: 0.3,
//			max: 10,
//			step: 0.2,
//			value: 3, // From the top of the eye
//			label: 'Eyebrow from eye'
//		},
//		eyebrow_angle: {
//			min: -2,
//			max: 2,
//			step: 0.2,
//			value: -0.5,
//			label: 'Eyebrow angle'
//		},
//		eyebrow_spacing: {
//			min: 0,
//			max: 20,
//			step: 1,
//			value: 5,
//			label: 'Eyebrow spacing'
//		},
//		// Nose
//		nose_height: {
//			min: 0.4,
//			max: 1,
//			step: 0.1,
//			value: 0.4,
//			label: 'Nose height'
//		},
//		nose_length: {
//			min: 0.2,
//			max: 30,
//			step: 0.2,
//			value: 15,
//			label: 'Nose length'
//		},
//		nose_width: {
//			min: 0,
//			max: 30,
//			step: 2,
//			value: 10,
//			label: 'Nose width'
//		},
//		// Mouth
//		mouth_height: {
//			min: 0.2,
//			max: 2,
//			step: 0.1,
//			value: 0.75, 
//			label: 'Mouth height'
//		},
//		mouth_width: {
//			min: 2,
//			max: 100,
//			step: 2,
//			value: 20,
//			label: 'Mouth width'
//		},
//		mouth_top_y: {
//			min: -10,
//			max: 30,
//			step: 0.5,
//			value: -2,
//			label: 'Upper lip'
//		},
//		mouth_bottom_y: {
//			min: -10,
//			max: 30,
//			step: 0.5,
//			value: 20,
//			label: 'Lower lip'
//		}					
//};

FaceVector.defaults = {
		// Head
		head_radius: {
			// id can be specified otherwise is taken head_radius
			min: 10,
			max: 100,
			step: 0.01,
			value: 30,
			label: 'Face radius'
		},
		head_scale_x: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 0.5,
			label: 'Scale head horizontally'
		},
		head_scale_y: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale head vertically'
		},
		// Eye
		eye_height: {
			min: 0.1,
			max: 0.9,
			step: 0.01,
			value: 0.4,
			label: 'Eye height'
		},
		eye_radius: {
			min: 2,
			max: 30,
			step: 0.01,
			value: 5,
			label: 'Eye radius'
		},
		eye_spacing: {
			min: 0,
			max: 50,
			step: 0.01,
			value: 10,
			label: 'Eye spacing'
		},
		eye_scale_x: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale eyes horizontally'
		},
		eye_scale_y: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale eyes vertically'
		},
		// Pupil
		pupil_radius: {
			min: 1,
			max: 9,
			step: 0.01,
			value: 1,  //this.eye_radius;
			label: 'Pupil radius'
		},
		pupil_scale_x: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale pupils horizontally'
		},
		pupil_scale_y: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale pupils vertically'
		},
		// Eyebrow
		eyebrow_length: {
			min: 1,
			max: 30,
			step: 0.01,
			value: 10,
			label: 'Eyebrow length'
		},
		eyebrow_eyedistance: {
			min: 0.3,
			max: 10,
			step: 0.01,
			value: 3, // From the top of the eye
			label: 'Eyebrow from eye'
		},
		eyebrow_angle: {
			min: -2,
			max: 2,
			step: 0.01,
			value: -0.5,
			label: 'Eyebrow angle'
		},
		eyebrow_spacing: {
			min: 0,
			max: 20,
			step: 0.01,
			value: 5,
			label: 'Eyebrow spacing'
		},
		// Nose
		nose_height: {
			min: 0.4,
			max: 1,
			step: 0.01,
			value: 0.4,
			label: 'Nose height'
		},
		nose_length: {
			min: 0.2,
			max: 30,
			step: 0.01,
			value: 15,
			label: 'Nose length'
		},
		nose_width: {
			min: 0,
			max: 30,
			step: 0.01,
			value: 10,
			label: 'Nose width'
		},
		// Mouth
		mouth_height: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 0.75, 
			label: 'Mouth height'
		},
		mouth_width: {
			min: 2,
			max: 100,
			step: 0.01,
			value: 20,
			label: 'Mouth width'
		},
		mouth_top_y: {
			min: -10,
			max: 30,
			step: 0.01,
			value: -2,
			label: 'Upper lip'
		},
		mouth_bottom_y: {
			min: -10,
			max: 30,
			step: 0.01,
			value: 20,
			label: 'Lower lip'
		}					
};

function FaceVector (faceVector) {
	
	//if (typeof(faceVector) !== 'undefined') {
	
	var faceVector = faceVector || {};
	
	this.scaleX = faceVector.scaleX || 1;
	this.scaleY = faceVector.scaleY || 1;
	
	this.color = faceVector.color || 'green';
	this.lineWidth = faceVector.lineWidth || 1;
	
	// Merge on key
	for (var key in FaceVector.defaults) {
		if (FaceVector.defaults.hasOwnProperty(key)){
			if (faceVector.hasOwnProperty(key)){
				this[key] = faceVector[key];
			}
			else {
				this[key] = FaceVector.defaults[key].value;
			}
		}
	}
		
	delete this.faceVector;
	
		
};

//Constructs a random face vector.
FaceVector.prototype.shuffle = function () {
	for (var key in this) {
		if (this.hasOwnProperty(key)) {
			
			if (key !== 'color') {
				this[key] = Math.random();
			}
		}
	}
};

//Computes the Euclidean distance between two FaceVectors.
FaceVector.prototype.distance = function (face) {
	return FaceVector.distance(this,face);
};
	
	
FaceVector.distance = function (face1, face2) {
	var sum = 0.0;
	var diff;
	
	for (var key in face1) {
		if (face1.hasOwnProperty(key)) {
			diff = face1[key] - face2[key];
			sum = sum + diff * diff;
		}
	}
	
	return Math.sqrt(sum);
};

FaceVector.prototype.toString = function() {
	var out = 'Face: ';
	for (var key in this) {
		if (this.hasOwnProperty(key)) {
			out += key + ' ' + this[key];
		}
	};
	return out;
};
 
 
 
 
/*
 * DataBar
 * 
 * Sends DATA msgs
 * 
 */

function DataBar(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'databar';
	this.name = 'Data Bar';
	this.version = '0.2.1';
	
	this.bar = null;
	this.root = null;
	
	this.recipient = null;
};

DataBar.prototype.append = function (root, ids) {
	
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idButton = PREF + 'sendButton';
	var idData = PREF + 'dataText';
	var idRecipient = PREF + 'recipient'; 
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
		if (ids.hasOwnProperty('data')) idData = ids.data;
		if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
	}
	
	var fieldset = nodeWindow.addFieldset(root, idFieldset, 'Send Data to Players');
	var sendButton = nodeWindow.addButton(fieldset, idButton);
	var dataInput = nodeWindow.addTextInput(fieldset, idData);
	
	this.recipient = nodeWindow.addRecipientSelector(fieldset, idRecipient);
	
	
	
	var that = this;

	sendButton.onclick = function() {
		
		var to = that.recipient.value;

		//try {
			//var data = JSON.parse(dataInput.value);
			data = dataInput.value;
			console.log('Parsed Data: ' + JSON.stringify(data));
			
			node.fire(node.OUT + node.actions.SAY + '.DATA',data,to);
//			}
//			catch(e) {
//				console.log('Impossible to parse the data structure');
//			}
	};
	
	return fieldset;
	
};

DataBar.prototype.listeners = function () {
	var that = this;
	var PREFIX = 'in.';
	
	node.onPLIST( function(msg) {
			nodeWindow.populateRecipientSelector(that.recipient,msg.data);
		}); 
}; 
 
 
 
/*!
 * GameBoard
 */ 

function GameBoard (id) {
	
	this.game = nodeGame.game;
	this.id = id || 'gboard';
	this.name = 'GameBoard';
	
	this.version = '0.2.1';
	
	this.board = null;
	this.root = null;
	
	this.noPlayers = 'No players connected...';
	
}

GameBoard.prototype.append = function(root) {
	this.root = root;
	var fieldset = nodeWindow.addFieldset(root, this.id + '_fieldset', 'Game State');
	this.board = nodeWindow.addDiv(fieldset,this.id);
	this.board.innerHTML = this.noPlayers;
	
};

GameBoard.prototype.listeners = function() {
	var that = this;
	
	var say = node.actions.SAY + '.';
	var set = node.actions.SET + '.';
	var get = node.actions.GET + '.'; 
	
	node.onPLIST( function (msg) {
		console.log('I Updating Board ' + msg.text);
		that.board.innerHTML = 'Updating...';
		
		var pl = node.create.PlayerList(msg.data);
		
		//console.log(pl);
		
		if (pl.size() !== 0) {
			that.board.innerHTML = '';
			pl.forEach( function(p) {
				//console.log(p);
				var line = '[' + p.id + "|" + p.name + "]> \t"; 
				
				var pState = p.state.state + '.' + p.state.step + ':' + p.state.round; 
				pState += ' ';
				
				switch (p.state.is) {
				
				case node.states.UNKNOWN:
					pState += '(unknown)';
					break;
				case node.states.PLAYING:
					pState += '(playing)';
					break;
				case node.states.DONE:
					pState += '(done)';
					break;	
				case node.states.PAUSE:
					pState += '(pause)';
					break;		
				default:
					pState += '('+p.state.is+')';
					break;		
				}
				
				if (p.state.paused) {
					pState += ' (P)';
				}
				
				that.board.innerHTML += line + pState +'\n<hr style="color: #CCC;"/>\n';
			});
			//this.board.innerHTML = pl.toString('<hr style="color: #CCC;"/>');
			}
			else {
				that.board.innerHTML = that.noPlayers;
			}
		});
}; 
 
 
 
/*!
 * GameSummary
 * 
 * Show Game Info
 */

function GameSummary(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'gamesummary';
	this.name = 'Game Summary';
	this.version = '0.2.1';
	
	this.fieldset = null;
	this.summaryDiv = null;
}


GameSummary.prototype.append = function (root, ids) {
	var that = this;
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset';
	var idSummary = PREF + 'player';
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('player')) idSummary = ids.player;
	}
	
	this.fieldset = nodeWindow.addFieldset(root, idFieldset, 'Game Summary');
	
	
	this.summaryDiv = nodeWindow.addDiv(this.fieldset,idSummary);
	
	
	that.writeSummary();
		
	return this.fieldset;
	
};

GameSummary.prototype.writeSummary = function(idState,idSummary) {
	var gName = document.createTextNode('Name: ' + this.game.name);
	var gDescr = document.createTextNode('Descr: ' + this.game.description);
	var gMinP = document.createTextNode('Min Pl.: ' + this.game.minPlayers);
	var gMaxP = document.createTextNode('Max Pl.: ' + this.game.maxPlayers);
	
	this.summaryDiv.appendChild(gName);
	this.summaryDiv.appendChild(document.createElement('br'));
	this.summaryDiv.appendChild(gDescr);
	this.summaryDiv.appendChild(document.createElement('br'));
	this.summaryDiv.appendChild(gMinP);
	this.summaryDiv.appendChild(document.createElement('br'));
	this.summaryDiv.appendChild(gMaxP);
	
	nodeWindow.addDiv(this.fieldset,this.summaryDiv,idSummary);
};

GameSummary.prototype.listeners = function() {};  
 
 
 
/*!
 * MsgBar
 * 
 */

function MsgBar(id){
	
	this.game = nodeGame.game;
	this.id = id || 'msgbar';
	this.name = 'Msg Bar';
	this.version = '0.2.1';
	
	this.recipient = null;
}

MsgBar.prototype.append = function (root, ids) {
	
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idButton = PREF + 'sendButton';
	var idMsgText = PREF + 'msgText';
	var idRecipient = PREF + 'recipient'; 
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
		if (ids.hasOwnProperty('msgText')) idMsgText = ids.msgText;
		if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
	}
	
	var fieldset = nodeWindow.addFieldset(root, idFieldset, 'Send Msg To Players');
	var sendButton = nodeWindow.addButton(fieldset, idButton);
	var msgText = nodeWindow.addTextInput(fieldset, idMsgText);
	this.recipient = nodeWindow.addRecipientSelector(fieldset, idRecipient);
	
	var that = this;
	
	sendButton.onclick = function() {

		// Should be within the range of valid values
		// but we should add a check
		var to = that.recipient.value;
		var msg = node.TXT(msgText.value,to);
		//console.log(msg.stringify());
	};

	return fieldset;
	
};

MsgBar.prototype.listeners = function(){
	var that = this;
	
	node.onPLIST( function(msg) {
		nodeWindow.populateRecipientSelector(that.recipient,msg.data);
		// was
		//that.game.window.populateRecipientSelector(that.recipient,msg.data);
	}); 
}; 
 
 
 
/*!
 * NextPreviousState
 * 
 * Step back and forth in the gameState
 * 
 */

function NextPreviousState(id) {
	this.game = nodeGame.game;
	this.id = id || 'nextprevious';
	this.name = 'Next,Previous State';
	this.version = '0.2.1';
	
}

NextPreviousState.prototype.append = function (root, ids) {
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idFwd = PREF + 'sendButton';
	var idRew = PREF + 'stateSel';
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('fwd')) idFwd = ids.fwd;
		if (ids.hasOwnProperty('rew')) idRew = ids.rew;
	}
	
	var fieldset 	= nodeWindow.addFieldset(root, idFieldset, 'Rew-Fwd');
	var rew 		= nodeWindow.addButton(fieldset, idRew, '<<');
	var fwd 		= nodeWindow.addButton(fieldset, idFwd, '>>');
	
	
	var that = this;

	fwd.onclick = function() {
		
		var state = that.game.next();
		
		if (state) {
			var stateEvent = node.OUT + node.actions.SET + '.STATE';
			//var stateEvent = 'out.' + action + '.STATE';
			node.fire(stateEvent,state,'ALL');
		}
		else {
			console.log('No next state. Not sent.');
			node.gsc.sendTXT('E: no next state. Not sent');
		}
	};

	rew.onclick = function() {
		
		var state = that.game.previous();
		
		if (state) {
			var stateEvent = node.OUT + node.actions.SET + '.STATE';
			//var stateEvent = 'out.' + action + '.STATE';
			node.fire(stateEvent,state,'ALL');
		}
		else {
			console.log('No previous state. Not sent.');
			node.gsc.sendTXT('E: no previous state. Not sent');
		}
	};
	
	
	return fieldset;
};

NextPreviousState.prototype.listeners = function () {};  
 
 
 
/*!
 * Slider Controls
 * 
 */

function SliderControls (id, features) {
	this.name = 'Slider Controls'
	this.version = '0.1';
	
	this.id = id;
	this.features = features;
	
	this.list = nodeWindow.create.List();
};

SliderControls.prototype.append = function(root) {
	
	var listRoot = this.list.getRoot();
	root.appendChild(listRoot);
	
	for (var key in this.features) {
		if (this.features.hasOwnProperty(key)) {
			
			var f = this.features[key];
			var id = f.id || key;
			
			var item = this.list.getItem();
			listRoot.appendChild(item);
			
			var attributes = {min: f.min, max: f.max, step: f.step, value: f.value};
			var slider = nodeWindow.addJQuerySlider(item, id, attributes);
			
			// If a label element is present it checks whether it is an
			// object literal or a string.
			// In the former case it scans the obj for additional properties
			if (f.label) {
				var labelId = 'label_' + id;
				var labelText = f.label;
				
				if (typeof(f.label) === 'object') {
					var labelText = f.label.text;
					if (f.label.id) {
						labelId = f.label.id; 
					}
				}
				
				nodeWindow.addLabel(slider, labelId, labelText, id);
			}
			
			
		}
	}
};

SliderControls.prototype.listeners = function() {
	
};

SliderControls.prototype.getAllValues = function() {
	var out = {};
	for (var key in this.features) {
		
		if (this.features.hasOwnProperty(key)) {
			console.log('STE ' + key + ' ' + document.getElementById(key).value);
			out[key] = Number(document.getElementById(key).value);
		}
	}
	
	return out;
}; 
 
 
 
/*
 * StateBar
 * 
 * Sends STATE msgs
 */

function StateBar(id) {
	
	this.game = nodeGame.game;;
	this.id = id || 'statebar';
	this.name = 'State Bar';
	this.version = '0.2.1';
	
	this.actionSel = null;
	this.recipient = null;
}

StateBar.prototype.append = function (root, ids) {
	
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idButton = PREF + 'sendButton';
	var idStateSel = PREF + 'stateSel';
	var idActionSel = PREF + 'actionSel';
	var idRecipient = PREF + 'recipient'; 
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
		if (ids.hasOwnProperty('state')) idStateSel = ids.idStateSel;
		if (ids.hasOwnProperty('action')) idActionSel = ids.idActionSel;
		if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
	}
	
	var fieldset 	= nodeWindow.addFieldset(root, idFieldset, 'Change Game State');
	var sendButton 	= nodeWindow.addButton(fieldset, idButton);
	var stateSel 	= nodeWindow.addStateSelector(fieldset, idStateSel);
	this.actionSel	= nodeWindow.addActionSelector(fieldset, idActionSel);
	this.recipient 	= nodeWindow.addRecipientSelector(fieldset, idRecipient);
	
	var that = this;

	sendButton.onclick = function() {

		// Should be within the range of valid values
		// but we should add a check
		var to = that.recipient.value;
		
		//var parseState = /(\d+)(?:\.(\d+))?(?::(\d+))?/;
		//var parseState = /^\b\d+\.\b[\d+]?\b:[\d+)]?$/;
		//var parseState = /^(\d+)$/;
		//var parseState = /(\S+)?/;
		var parseState = /^(\d+)(?:\.(\d+))?(?::(\d+))?$/;
		
		var result = parseState.exec(stateSel.value);
		
		if (result !== null) {
			// Note: not result[0]!
			var state = result[1];
			var step = result[2] || 1;
			var round = result[3] || 1;
			console.log('Action: ' + that.actionSel.value + ' Parsed State: ' + result.join("|"));
			
			var state = node.create.GameState(state,step,round);
			
			var stateEvent = node.OUT + that.actionSel.value + '.STATE';
			node.fire(stateEvent,state,to);
		}
		else {
			console.log('Not valid state. Not sent.');
			node.gsc.sendTXT('E: not valid state. Not sent');
		}
	};

	return fieldset;
	
};

StateBar.prototype.listeners = function () {
	var that = this;
	var say = node.actions.SAY + '.';
	var set = node.actions.SET + '.';
	var get = node.actions.GET + '.'; 
	
	node.onPLIST( function(msg) {
		
		nodeWindow.populateRecipientSelector(that.recipient,msg.data);
		// was
		//that.game.window.populateRecipientSelector(that.recipient,msg.data);
	}); 
};  
 
 
 
/*
 * StateDisplay
 * 
 * Sends STATE msgs
 */

function StateDisplay(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'statedisplay';
	this.name = 'State Display';
	this.version = '0.2.1';
	
	this.fieldset = null;
	this.stateDiv = null;
}


StateDisplay.prototype.append = function (root, ids) {
	var that = this;
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset';
	var idPlayer = PREF + 'player';
	var idState = PREF + 'state'; 
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('player')) idPlayer = ids.player;
		if (ids.hasOwnProperty('state')) idState = ids.state;
	}
	
	this.fieldset = nodeWindow.addFieldset(root, idFieldset, 'Player Status');
	
	
	this.playerDiv = nodeWindow.addDiv(this.fieldset,idPlayer);
	
	var checkPlayerName = setInterval(function(idState,idPlayer){
			if(that.game.player !== null){
				clearInterval(checkPlayerName);
				that.updateAll();
			}
		},100);

	return this.fieldset;
	
};

StateDisplay.prototype.updateAll = function(idState,idPlayer) {
	var pName = document.createTextNode('Name: ' + this.game.player.name);
	var pId = document.createTextNode('Id: ' + this.game.player.id);
	
	this.playerDiv.appendChild(pName);
	this.playerDiv.appendChild(document.createElement('br'));
	this.playerDiv.appendChild(pId);
	
	this.stateDiv = nodeWindow.addDiv(this.playerDiv,idState);
	this.updateState(this.game.gameState);
};

StateDisplay.prototype.updateState =  function(state) {
	var that = this;
	var checkStateDiv = setInterval(function(){
		if(that.stateDiv){
			clearInterval(checkStateDiv);
			that.stateDiv.innerHTML = 'State: ' +  state.toString() + '<br />';
			// was
			//that.stateDiv.innerHTML = 'State: ' +  GameState.stringify(state) + '<br />';
		}
	},100);
};

StateDisplay.prototype.listeners = function () {
	var that = this;
	var say = node.actions.SAY + '.';
	var set = node.actions.SET + '.';
	var get = node.actions.GET + '.'; 
	var IN =  node.IN;
	var OUT = node.OUT;
	
	node.on( 'STATECHANGE', function(state) {
		that.updateState(state);
	}); 
};  
 
 
 
/*
 * Wait Screen
 * 
 * Show a standard waiting screen
 * 
 */

//var waitScreen = function(){

function WaitScreen(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'waiting';
	this.name = 'WaitingScreen';
	this.version = '0.2.1';
	
	
	this.text = 'Waiting for other players...';
	this.waitingDiv = null;
	
}

WaitScreen.prototype.append = function (root, id) {};

WaitScreen.prototype.listeners = function () {
	var that = this;
	node.on('WAIT', function(text) {
		that.waitingDiv = nodeWindow.addDiv(document.body, that.id);
		if (that.waitingDiv.style.display === "none"){
			that.waitingDiv.style.display = "";
		}
	
		that.waitingDiv.appendChild(document.createTextNode(that.text || text));
		that.game.pause();
	});
	
	// It is supposed to fade away when a new state starts
	node.on('STATECHANGE', function(text) {
		if (that.waitingDiv) {
			
			if (that.waitingDiv.style.display == ""){
				that.waitingDiv.style.display = "none";
			}
		// TODO: Document.js add method to remove element
		}
	});
	
};  
 
 
 
/*
 * Wall
 * 
 * Prints lines sequentially;
 * 
 */


function Wall(id) {
	this.game = nodeGame.game;
	this.id = id || 'wall';
	this.name = 'Wall';
	this.version = '0.2.1';
	
	this.wall = null;
	
	this.buffer = [];
	
	this.counter = 0;
	// TODO: buffer is not read now
	
}

Wall.prototype.append = function (root, id) {
	var fieldset = nodeWindow.addFieldset(root, this.id+'_fieldset', 'Game Log');
	var idLogDiv = id || this.id;
	this.wall = nodeWindow.addElement('pre', fieldset, idLogDiv);
};

Wall.prototype.write = function(text) {
	if (document.readyState !== 'complete') {
        this.buffer.push(s);
    } else {
    	var mark = this.counter++ + ') ' + Utils.getTime() + ' ';
    	this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
        this.buffer = []; // Where to place it?
    }  
};

Wall.prototype.listeners = function() {
	var that = this;
//		this.game.on('in.say.MSG', function(p,msg){
//			that.write(msg.toSMS());
//		});
//	
//		this.game.on('out.say.MSG', function(p,msg){
//			that.write(msg.toSMS());
//		});
//	
//	
//		this.game.on('MSG', function(p,msg){
//			that.write(msg.toSMS());
//		});
	
	node.on('LOG', function(msg){
		that.write(msg);
	});
};  
 
 
 
 
 
 
 
/*!
 * nodeWindow v0.3
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on So 16. Okt 10:26:50 CEST 2011
 *
 */
 
 
(function( nodeGame ) {

	console.log('nodeWindow: loading...');
	
	if (nodeGame) {
		var gsc = nodeGame.gsc || null;
		var game = nodeGame.game || null;
	}
	else {
		console.log('nodeWindow: nodeGame not found');
	}
	
// Starting Classes

/*!
 * Canvas
 * 
 */ 

function Canvas(canvas) {
	this.canvas = canvas;
	// 2D Canvas Context 
	this.ctx = canvas.getContext('2d');
	
	this.centerX = canvas.width / 2;
	this.centerY = canvas.height / 2;
	
	this.width = canvas.width;
	this.height = canvas.height;
	
	console.log(canvas.width);
	console.log(canvas.height);		
};

Canvas.prototype = {
			
	constructor: Canvas,
	
	drawOval: function (settings) {
	
		// We keep the center fixed
		var x = settings.x / settings.scale_x;
		var y = settings.y / settings.scale_y;
	
		var radius = settings.radius || 100;
		//console.log(settings);
		//console.log('X,Y(' + x + ', ' + y + '); Radius: ' + radius + ', Scale: ' + settings.scale_x + ',' + settings.scale_y);
		
		this.ctx.lineWidth = settings.lineWidth || 1;
		this.ctx.strokeStyle = settings.color || '#000000';
		
		this.ctx.save();
		this.ctx.scale(settings.scale_x, settings.scale_y);
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, Math.PI*2, false);
		this.ctx.stroke();
		this.ctx.closePath();
		this.ctx.restore();
	},
	
	drawLine: function (settings) {
	
		var from_x = settings.x;
		var from_y = settings.y;
	
		var length = settings.length;
		var angle = settings.angle;
			
		// Rotation
		var to_x = - Math.cos(angle) * length + settings.x;
		var to_y =  Math.sin(angle) * length + settings.y;
		//console.log('aa ' + to_x + ' ' + to_y);
		
		//console.log('From (' + from_x + ', ' + from_y + ') To (' + to_x + ', ' + to_y + ')');
		//console.log('Length: ' + length + ', Angle: ' + angle );
		
		this.ctx.lineWidth = settings.lineWidth || 1;
		this.ctx.strokeStyle = settings.color || '#000000';
		
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.moveTo(from_x,from_y);
		this.ctx.lineTo(to_x,to_y);
		this.ctx.stroke();
		this.ctx.closePath();
		this.ctx.restore();
	},
	
	scale: function (x,y) {
		this.ctx.scale(x,y);
		this.centerX = this.canvas.width / 2 / x;
		this.centerY = this.canvas.height / 2 / y;
	},
	
	clear: function() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		// For IE
		var w = this.canvas.width;
		this.canvas.width = 1;
		this.canvas.width = w;
	}
	
}; 
 
/*!
 * Document
 * 
 */

function Document() {};

Document.prototype.addButton = function (root, id, text, attributes) {
	var sb = document.createElement('button');
	sb.id = id;
	sb.appendChild(document.createTextNode(text || 'Send'));	
	this.addAttributes2Elem(sb, attributes);

	root.appendChild(sb);
	return sb;
};

Document.prototype.addFieldset = function (root, id, legend, attributes) {
	var f = this.addElement('fieldset', root, id, attributes);
	var l = document.createElement('Legend');
	l.appendChild(document.createTextNode(legend));	
	f.appendChild(l);
	root.appendChild(f);
	return f;
};

Document.prototype.addTextInput = function (root, id, attributes) {
	var mt =  document.createElement('input');
	mt.id = id;
	mt.setAttribute('type', 'text');
	this.addAttributes2Elem(mt, attributes);
	root.appendChild(mt);
	return mt;
};

Document.prototype.addCanvas = function (root, id, attributes) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
		
	if (!context) {
		alert('Canvas is not supported');
		return false;
	}
	
	canvas.id = id;
	this.addAttributes2Elem(canvas, attributes);
	root.appendChild(canvas);
	return canvas;
};

Document.prototype.addSlider = function (root, id, attributes) {
	var slider = document.createElement('input');
	slider.id = id;
	slider.setAttribute('type', 'range');
	this.addAttributes2Elem(slider, attributes);
	root.appendChild(slider);
	return slider;
};

Document.prototype.addJQuerySlider = function (root, id, attributes) {
	var slider = document.createElement('div');
	slider.id = id;
	slider.slider(attributes);
	root.appendChild(slider);
	return slider;
};


Document.prototype.addLabel = function (root, id, labelText, forElem, attributes) {
	var label = document.createElement('label');
	label.id = id;
	label.appendChild(document.createTextNode(labelText));	
	label.setAttribute('for', forElem);
	this.addAttributes2Elem(label, attributes);
	
	var root = document.getElementById(forElem);
	root.parentNode.insertBefore(label,root);
	return label;
	
	// Add the label immediately before if no root elem has been provided
	if (!root) {
		var root = document.getElementById(forElem);
		root.insertBefore(label);
	}
	else {
		root.appendChild(label);
	}
	return label;
};

Document.prototype.addSelect = function (root, id, attributes) {
	return this.addElement('select', root, id, attributes);
};

Document.prototype.populateSelect = function (select,list) {
	
	for (var key in list) {
		if (list.hasOwnProperty(key)) {
			var opt = document.createElement('option');
			opt.value = list[key];
			opt.appendChild(document.createTextNode(key));
			select.appendChild(opt);
		}
	}
};

Document.prototype.write = function (root, text) {
	var tn = document.createTextNode(text);
	root.appendChild(tn);
	return tn;
};

Document.prototype.writeln = function (root, text, rc) {
	var RC = rc || '<br />';
	return this.write(root, text+RC);
};

// IFRAME

Document.prototype.addIFrame = function (root, id, attributes) {
	var attributes = {'name' : id}; // For Firefox
	return this.addElement('iframe', root, id, attributes);
};


// BR

Document.prototype.addBr = function (root) {
	var br = document.createElement('br');
	return this.insertAfter(br,root);
};

// CSS

Document.prototype.addCSS = function (root, css, id, attributes) {
	
	var attributes = attributes || {'rel' : 'stylesheet',
									'type': 'text/css'};
	
	attributes.href = css;
	
	var id = id || 'maincss';
	
	return this.addElement('link', root, id, attributes);
};


Document.prototype.addDiv = function (root, id, attributes) {
	return this.addElement('div', root, id, attributes);
};


// TODO: Potentially unsafe
// Works only with Chrome
Document.prototype.loadFile = function (container,file) {
	
	// Check for the various File API support.
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
	  console.log('The File APIs are not fully supported in this browser.');
	  return false;
	}
	function onInitFs(fs) {
	  console.log('Opened file system: ' + fs.name);
	}
	
	function errorHandler(e) {
		  var msg = '';

		  switch (e.code) {
		    case FileError.QUOTA_EXCEEDED_ERR:
		      msg = 'QUOTA_EXCEEDED_ERR';
		      break;
		    case FileError.NOT_FOUND_ERR:
		      msg = 'NOT_FOUND_ERR';
		      break;
		    case FileError.SECURITY_ERR:
		      msg = 'SECURITY_ERR';
		      break;
		    case FileError.INVALID_MODIFICATION_ERR:
		      msg = 'INVALID_MODIFICATION_ERR';
		      break;
		    case FileError.INVALID_STATE_ERR:
		      msg = 'INVALID_STATE_ERR';
		      break;
		    default:
		      msg = 'Unknown Error';
		      break;
		  }

		  console.log('Error: ' + msg);
	};
	
	// second param is 5MB, reserved space for storage
	window.requestFileSystem(window.PERSISTENT, 5*1024*1024, onInitFs, errorHandler);
	
		
	container.innerHTML += 'DONE FS';
	return container;
};

// Util

Document.prototype.addElement = function (elem, root, id, attributes) {
	var e = document.createElement(elem);
	if (id) {
		e.id = id;
	}
	this.addAttributes2Elem(e, attributes);
	
	root.appendChild(e);
	return e;
};

Document.prototype.addAttributes2Elem = function (e, a) {
	
	for (var key in a) {
		if (a.hasOwnProperty(key)){
			e.setAttribute(key,a[key]);
		}
	}
	return e;
};

Document.prototype.removeChildrenFromNode = function (e) {
	
    if(!e) {
        return false;
    }
    if(typeof(e)=='string') {
        e = xGetElementById(e);
    }
    while (e.hasChildNodes()) {
        e.removeChild(e.firstChild);
    }
    return true;
};

Document.prototype.insertAfter = function (node, referenceNode) {
	  referenceNode.insertBefore(node, referenceNode.nextSibling);
};

 
 
/*!
 * GameWindow
 */

GameWindow.prototype = new Document();
GameWindow.prototype.constructor = GameWindow;

GameWindow.prototype.create = {};

GameWindow.prototype.create.Canvas = function(canvas){
	return new Canvas(canvas);
};

GameWindow.prototype.create.List = function(id){
	return new List(id);
};

function GameWindow() {
	
	Document.call(this);
	this.mainframe = 'mainframe';
	this.root = this.generateRandomRoot();
};

GameWindow.prototype.generateRandomRoot = function () {
	// We assume that the BODY element always exists
	// TODO: Check if body element does not exist and add it
	var root = Math.floor(Math.random()*10000);
	var rootEl = this.addElement('div', document.body, root);
	return rootEl;
};

GameWindow.prototype.setup = function (type){

	
	switch (type) {
	
	case 'MONITOR':
		
		nodeGame.removeListener('in.STATE');
	
		// TODO: use multiple ifs instead
		try {
			
			var nps = new NextPreviousState();
			this.addGadget(this.root,nps);
			
			var gs = new GameSummary();
			this.addGadget(this.root,gs);
			
			var sd = new StateDisplay();
			this.addGadget(this.root,sd);
			
			var sb = new StateBar();
			this.addGadget(this.root,sb);

			var db = new DataBar();
			this.addGadget(this.root,db);
			
			var mb = new MsgBar();
			nodeWindow.addGadget(this.root,mb);
			
			var gm = new GameBoard();
			this.addGadget(this.root,gm);
					
			var w = new Wall();
			this.addGadget(this.root,w);
		}
		catch(e) {
			console.log('nodeWindow: Standard Gadget not found ' + e.message);
		}
		
		break;
		
		
	case 'PLAYER':
		
		var maincss		= this.addCSS(this.root, 'style.css');
	    var mainframe 	= this.addIFrame(this.root,'mainframe');
	    
	    var ws = new WaitScreen();
		nodeWindow.addGadget(this.root,ws);
	    
		break;
	}
};

//1. Load a Frame into the mainframe or other specified frame
//2. Wait until the frame is loaded
//3. Put a reference of the loaded frame.document into this.frame
//4. Exec the callback function
//GameWindow.prototype.loadFrame = function (url, func, frame) {
//		var frame = this.mainframe || frame;
//		var that = this;
//	
//		// TODO: check which one are really necessary
//		//window.frames[frame].src = url;
//		window.frames[frame].location = url;
//		//window.frames[frame].location.href = url;
//		console.log('Loaded Frame');
//		window.frames[frame].document.onload = function() {
//			console.log('THIS' + this);
//		    if (this.readyState==='complete'){
//		    	that.frame = window.frames[frame].document;
//		    	if (func) {
//		    		func.call(); // TODO: Pass the right this reference
//		    		console.log('Frame Loaded correctly!');
//		    	}
//		    }
//		    else {
//		    	console.log('DEBUG: frame not ready ' + window.frames[frame].document.readyState);
//		    }
//		};
//};


// FAKE ONLOAD  TODO: try to make it work with onload
GameWindow.prototype.loadFrame = function (url, func, frame) {
	var frame = this.mainframe || frame;
	var that = this;	
	window.frames[frame].location = url;
	//window.frames[frame].location.href = url;
	
	this.frame = window.frames[frame].document;
	var ii=0;
	var isFrameLoaded = setInterval( function() {
		if (window.frames[frame].document.readyState === 'complete') {
		//if (window.frames[frame].document) {	
			clearInterval(isFrameLoaded);
			//console.log('Interval cleared');
			that.frame = window.frames[frame].document;
			if (func) {
	    		func.call(); // TODO: Pass the right this reference
	    		//console.log('Frame Loaded correctly!');
	    	}
		}
		else {
			console.log('not yet ' + window.frames[frame].document.readyState);
		}
	}, 100);
};

GameWindow.prototype.loadPage = function (url, frame) {
	var frame = this.mainframe || frame;
	var that = this;
	
	// TODO: check which one are really necessary
	window.frames[frame].src = url;
	window.frames[frame].location = url;
	window.frames[frame].location = url;
	window.frames[frame].location.href = url;
	
	window.frames[frame].document.onreadystatechange = function() {
	    if (this.readyState==='complete'){
	    	that.frame = window.frames[frame].document;
	    }
	    else {
	    	console.log('not yet ' + window.frames[frame].document.readyState);
	    }
	};
};

GameWindow.prototype.getFrame = function() {
	return this.frame = window.frames['mainframe'].document;
};


// Header

GameWindow.prototype.addHeader = function (root, id) {
	return this.addDiv(root,id);
};

// Gadget

GameWindow.prototype.addGadget = function (root, g) {
	
	console.log('nodeWindow: registering gadget ' + g.name + ' v.' +  g.version);
	try {
		g.append(root);
		g.listeners();
	}
	catch(e){
		throw 'Not compatible gadget: ' + e.message;
	}
};

// Recipients

GameWindow.prototype.addRecipientSelector = function (root, id) {

	var toSelector = document.createElement('select');
	toSelector.id = id;

	root.appendChild(toSelector);
	
	this.addStandardRecipients(toSelector);
	
	//this.toSels.push(toSelector);
	
	return toSelector;
};

GameWindow.prototype.addStandardRecipients = function (toSelector) {
		
	var opt = document.createElement('option');
	opt.value = 'ALL';
	opt.appendChild(document.createTextNode('ALL'));
	toSelector.appendChild(opt);
	
	var opt = document.createElement('option');
	opt.value = 'SERVER';
	opt.appendChild(document.createTextNode('SERVER'));
	toSelector.appendChild(opt);
	

	
};

GameWindow.prototype.populateRecipientSelector = function (toSelector, playerList) {
	
	if (typeof(playerList) !== 'object' || typeof(toSelector) !== 'object') {
		return;
	}
	
	this.removeChildrenFromNode(toSelector);
	this.addStandardRecipients(toSelector);
	
	
	var opt;
	var pl = node.create.PlayerList(playerList);
	
	
	try {
		pl.forEach( function(p) {
			opt = document.createElement('option');
			opt.value = p.connid;
			opt.appendChild(document.createTextNode(p.name));
			toSelector.appendChild(opt);
			}, 
			toSelector);
	}
	catch (e) {
		console.log('(E) Bad Formatted Player List. Discarded. ' + p);
	}
};

// Actions


GameWindow.prototype.addActionSelector = function (root, id) {

	var actionSelector = document.createElement('select');
	actionSelector.id = id;

	root.appendChild(actionSelector);
	this.populateSelect(actionSelector, node.actions);
	
	return actionSelector;
};

// States

GameWindow.prototype.addStateSelector = function (root, id) {
	var stateSelector = this.addTextInput(root,id);
	return stateSelector;
};


// 
 
/*!
 * 
 * List: handle list operation
 * 
 */

function List(id) {
	this.id = id || 'list';
	
	this.FIRST_LEVEL = 'dl';
	this.SECOND_LEVEL = 'dt';
	this.THIRD_LEVEL = 'dd';

	this.list = [];
}

List.prototype.append = function(root) {
	return root.appendChild(this.write());
};

List.prototype.add = function(elem) {
	this.list.push(elem);
};

List.prototype.write = function() {
	
	var root = document.createElement(this.FIRST_LEVEL);
	
	var i = 0;
	var len = list.length;
	for (;i<len;i++) {
		var elem = document.createElement(this.SECOND_LEVEL);
		elem.appendChild(list[i]);
		root.appendChild(elem);
	}
	
	return root;
};

List.prototype.getRoot = function() {
	return document.createElement(this.FIRST_LEVEL);
};

List.prototype.getItem = function() {
	return document.createElement(this.SECOND_LEVEL);
};
 
 

	//Expose nodeGame to the global object
	window.nodeGameWindow = window.nodeWindow = new GameWindow();
	

})(window.nodeGame); 
 
 
 
