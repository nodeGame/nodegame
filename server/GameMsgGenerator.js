var GameMsg = require('./GameMsg');
var GameState = require('./GameState');

module.exports = GameMsgGenerator; 

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

GameMsgGenerator.prototype.createHI = function(text,to,reliable) {
	
	var rel = reliable || 0;
	
	return new GameMsg(
						this.session,
						this.currentState,
						GameMsg.actions.SAY,
						GameMsg.targets.HI,
						this.sender,
						to,
						text,
						to,
						null,
						rel // Should be reliable
						);
};


// STATE

GameMsgGenerator.prototype.saySTATE = function(plist,to,reliable) {
	return this.createSTATE(GameMsg.actions.SAY, plist, to,reliable);
};

GameMsgGenerator.prototype.setSTATE = function(plist,to,reliable) {
	return this.createSTATE(GameMsg.actions.SET, plist, to,reliable);
};

GameMsgGenerator.prototype.getSTATE = function(plist,to,reliable) {
	return this.createSTATE(GameMsg.actions.GET, plist, to,reliable);
};

GameMsgGenerator.prototype.createSTATE = function(action,state,to,reliable) {
	
	//var rel = reliable || 1;
	var rel = reliable || 0;
	
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

GameMsgGenerator.prototype.sayPLIST = function(plist,to,reliable) {
	return this.createPLIST(GameMsg.actions.SAY, plist, to,reliable);
};

GameMsgGenerator.prototype.setPLIST = function(plist,to,reliable) {
	return this.createPLIST(GameMsg.actions.SET, plist, to,reliable);
};

GameMsgGenerator.prototype.getPLIST = function(plist,to,reliable) {
	return this.createPLIST(GameMsg.actions.GET, plist, to,reliable);
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


//TXT

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
	
	// var rel = reliable || 1;
	var rel = reliable || 0;
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