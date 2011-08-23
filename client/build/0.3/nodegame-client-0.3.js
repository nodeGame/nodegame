/*!
 * nodeGame Client v0.3
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on Mo 22. Aug 17:35:46 CEST 2011
 *
 */
 
 
(function( window ) {

  console.log('nodeGame: loading...');
  
// All the Functions

 function EventListener(){
    this._listeners = {};
    this._localListeners = {};
}

EventListener.prototype = {

    constructor: EventListener,

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

    fire: function(event,p1, p2, p3){ // Up to 3 parameters
    	
    	if (typeof event == "string"){
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
        if (this._listeners[event.type] instanceof Array){
            var listeners = this._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                // TODO: Check why fire the event name as well??
            	//listeners[i].call(this, event, p1, p2, p3);
                listeners[i].call(this, p1, p2, p3);
            }
        }
        
        // Local Listeners
        if (this._localListeners[event.type] instanceof Array){
            var listeners = this._localListeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                // TODO: Check why fire the event name as well??
            	//listeners[i].call(this, event, p1, p2, p3);
                listeners[i].call(this, p1, p2, p3);
            }
        }
        
    },

    removeListener: function(type, listener){
    	
    	//console.log('Trying to remove ' + type + ' ' + listener);
    	
        if (this._listeners[type] instanceof Array){
        	
        	if (listener === null || listener === undefined) {
        		delete this._listeners[type];
        		//console.log('Removed listener ' + type);
        		return true;
        	}
        	
        	
            var listeners = this._listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
            	
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
	
	//this._localListeners = {};
	
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
		
		node.on("DONE", function(msg){
			that.is(GameState.iss.DONE);
			that.publishState();
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
 */

function GameMsgGenerator (session,sender,currentState) {	
	this.session = session;
	this.sender = sender;
	this.currentState = currentState;
};

GameMsgGenerator.prototype.setCurrentState = function (state) {
	this.currentState = state;
};

GameMsgGenerator.prototype.getCurrentState = function () {
	return this.currentState;
};


// HI

//Notice: this is different from the server;
GameMsgGenerator.prototype.createHI = function(player,to,reliable) {

  var rel = reliable || 0;

  return new GameMsg(
            this.session,
            this.currentState,
            GameMsg.actions.SAY,
            GameMsg.targets.HI,
            this.sender,
            to,
            'Player: ' + player.name + '(' + player.connid + ') ready.',
            player,
            null,
            rel
            );


};

// STATE

GameMsgGenerator.prototype.saySTATE = function(target,plist,to,reliable) {
	return this.createSTATE(GameMsg.SAY, plist, to,reliable);
};

GameMsgGenerator.prototype.setSTATE = function(target,plist,to,reliable) {
	return this.createSTATE(GameMsg.SET, plist, to,reliable);
};

GameMsgGenerator.prototype.getSTATE = function(target,plist,to,reliable) {
	return this.createSTATE(GameMsg.GET, plist, to,reliable);
};

GameMsgGenerator.prototype.createSTATE = function(action,state,to,reliable) {
	
	var rel = reliable || 1;
	
	return new GameMsg(
						this.session,
						this.currentState,
						action,
						GameMsg.targets.STATE,
						this.sender,
						to,
						'New State: ' + GameState.stringify(state),
						state,
						null,
						rel
						);
};


// PLIST

GameMsgGenerator.prototype.sayPLIST = function(target,plist,to,reliable) {
	return this.createPLIST(GameMsg.SAY, plist, to,reliable);
};

GameMsgGenerator.prototype.setPLIST = function(target,plist,to,reliable) {
	return this.createPLIST(GameMsg.SET, plist, to,reliable);
};

GameMsgGenerator.prototype.getPLIST = function(target,plist,to,reliable) {
	return this.createPLIST(GameMsg.GET, plist, to,reliable);
};

GameMsgGenerator.prototype.createPLIST = function(target,plist,to,reliable) {
	
	//console.log('Creating plist msg ' + plist + ' ' + plist.size());
	
	var rel = reliable || 0;
	
	return new GameMsg(
						this.session, 
						this.currentState,
						target,
						GameMsg.targets.PLIST,
						this.sender,
						to,
						'List of Players: ' + plist.size(),
						plist.pl,
						null,
						rel
						);
};


//MSG

GameMsgGenerator.prototype.createTXT = function(text,to,reliable) {
	
	//console.log("STE: " + text);
	
	var rel = reliable || 0;
	
	return new GameMsg(
						this.session,
						this.currentState,
						GameMsg.actions.SAY,
						GameMsg.targets.TXT,
						this.sender,
						to,
						text,
						null,
						null,
						rel
						);
	
	
};


// DATA

GameMsgGenerator.prototype.createDATA = function(data,to,text, reliable) {
	
	var rel = reliable || 1;
	var text = text || 'data';
	
	return new GameMsg(
						this.session, 
						this.currentState,
						GameMsg.actions.SAY,
						GameMsg.targets.DATA,
						this.sender,
						to,
						text,
						data,
						null,
						rel
						);
};


// ACK

GameMsgGenerator.prototype.createACK = function(gm,to,reliable) {
	
	var rel = reliable || 0;
	
	var newgm = new GameMsg(
							this.session, 
							this.currentState,
							GameMsg.actions.SAY,
							GameMsg.targets.ACK,
							this.sender,
							to,
							'Msg ' + gm.id + ' correctly received',
							gm.id,
							null,
							rel
							);
	
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
		

function GameMsg (session, currentState, action, target, from, to, text, data,
					priority, reliable) {
		
	this.id = Math.floor(Math.random()*1000000);

	this.action = action; 
	this.target = target;
	
	this.session = session;
	this.currentState = currentState;
	
	this.from = from;
	this.to = to;
	this.text = text;
	this.data = data;
	
	this.priority = priority;
	this.reliable = reliable;

	this.created = Utils.getDate();
	this.forward = 0; // is this msg just a forward?	
	
};
// Does not change the msg ID
GameMsg.prototype.import = function(jsonMsg) {
	
	this.session = jsonMsg.session;
	this.currentState = jsonMsg.currentState;
	this.target = jsonMsg.target; // was action
	this.from = jsonMsg.from;
	this.to = jsonMsg.to;
	this.text = jsonMsg.text;
	this.action = jsonMsg.action; 
	this.data = jsonMsg.data;
	this.priority = jsonMsg.priority;
	this.reliable = jsonMsg.reliable;
	this.forward = jsonMsg.forward;
	
};

// Copy everything
GameMsg.prototype.clone = function(jsonMsg) {
	
	this.import(jsonMsg);
	this.id = jsonMsg.id;
};

GameMsg.prototype.stringify = function() {
	return JSON.stringify(this);
};

GameMsg.prototype.toString = function() {
	
	var SPT = ",\t";
	var SPTend = "\n";
	var DLM = "\"";
	
	var gm = new GameState();
	gm.import(this.currentState);
	
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

GameMsg.parse = function(msg) {
	try {
		var gm = new GameMsg();
		gm.import(msg);
		return gm;
	}
	catch(e){
		throw 'Error while trying to parse GameMsg ' + e.message;
	}
};

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
 * GameSocketClient
 *
 *
 */

function GameSocketClient(options,nodeGame) {
	
	this.name = options.name;
	
	this.host = options.host;
	this.port = options.port;
		
	this.w = this.connect();
	
	this.game = null;
}

GameSocketClient.prototype.setGame = function(game) {
	this.game = game;
};


GameSocketClient.prototype.connect = function() {
	var url = "ws://" + this.host + ":" + this.port;
    var w = new WebSocket(url);
    this.attachFirstListeners(w);
    return w;
};

/*

I/O Functions

*/

//Parse the message newly received in the Socket
GameSocketClient.prototype.secureParse = function (e) {
	
	var msg = new GameMsg(null); // the newly received msg
	
	try {
		msg.clone(JSON.parse(e.data));
		console.log('R ' + msg);
		node.fire('LOG', 'R: ' + msg.toSMS());
	}
	catch(e) {
		var error = "Malformed msg received: " + e;
		node.fire('LOG', 'E: ' + error);
		//alert(error);
	}
	
	return msg;
};

// Websocket is waiting for the HI msg from the Server
GameSocketClient.prototype.attachFirstListeners = function (w) {
	
	var that = this;
	
    // Registering Event Listeners
    w.onopen = function() {
    	var connString = 'nodeGame: connection open';
        console.log(connString); 
    };

    w.onmessage = function(e) {

    	var msg = that.secureParse(e);
    	
		if (msg.target === 'HI'){
			that.player = new Player(msg.data,that.name);
			console.log('HI: ' + that.player);
			
			
			// Get Ready to play
			that.attachMsgListeners(w,msg.session,this.msgClientListeners);
			
			// Send own name to all
			that.sendHI(that.player,'ALL');
			
			// Confirmation of reception was required
			if (msg.reliable) {
				that.sendACK(msg);
			}
	   	 } 
    };

    w.onclose = function(e) {
    	// TODO: this generates an error: attempt to run compile-and-go script on a cleared scope
    	console.log("closed");
    };
};

GameSocketClient.prototype.attachMsgListeners = function(w, session, func) {   

	console.log('nodeGame: Attaching FULL listeners');
	w.removeEventListener('message',this.w.onmessage,false);
	
	this.gmg = new GameMsgGenerator(session,this.player.getConnid(),new GameState());
	
    //w.onmessage = func.call;

	var that = this;
	
	w.onmessage = function(e) {
		
		var msg = that.secureParse(e);
		node.fire(msg.toInEvent(), msg);
		
		// Confirmation of reception was required
		if (msg.reliable) {
			that.sendACK(msg);
		}
	};
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
	this.w.send(msg.stringify());
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

// Inheriting EventListener

if (typeof(WebSocket) === 'undefined') {
	alert('Sorry, Web Sockets are not supported in this browser. Aborting...');
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
	return this.add(player.connid, player.name);
};

PlayerList.prototype.add = function (connid,name) {	
	// Check if the id is unique
	if (typeof(this.pl[connid]) === 'undefined') {
		this.pl[connid] = new Player(connid,name);
		console.log('Added Player ' + this.pl[connid]);
		return true;
	}
		
	console.log('E: Attempt to add a new player already in the player list' + this.pl.connid);//[connid]);
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
    	 return o.getConnid();
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
	
	if (typeof(this.pl[player.connid]) !== 'undefined') {
		this.pl[connid] = player;
		return true;
	}
	
	console.log('W: Attempt to access a non-existing player from the the player list ' + player.connid);
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
		
		result[gid].add(copy[idx].connid,copy[idx].name);
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

function Player(connid, name, state) {
	
	// PRIVATE variables
	this.connid = connid;
	this.name = name;
	this.state = state || new GameState();
}

Player.prototype.getConnid = function() {
	return this.connid;
};

Player.prototype.getName = function() {
	return this.name;
};

Player.prototype.import = function (player) {
	this.connid = player.connid;
	this.name = player.name;
	this.state = player.state;
};

Player.prototype.updateState = function (state) {
	this.state = player.state;
};

//With Private Variables: not working!

//function Player(connid, name) {
//	
//	// PRIVATE variables
//	var connid = connid;
//	var name = name;
//	
//	// PRIVILEGED methods;
//	this.getConnid = function() { 
//		return connid;
//		};
//  this.getName = function() {
//  	return name;
//  };
//}


Player.prototype.toString = function() {
	var out = this.getConnid() + ": " + this.getName() + ", " + this.state;
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