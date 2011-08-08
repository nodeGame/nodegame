/*!
 * nodeGadgets v0.3
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on Mo 8. Aug 19:54:48 CEST 2011
 *
 */
 
 
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
				var line = '[' + p.connid + "|" + p.name + "]> \t"; 
				
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
	this.version = '0.2';
	
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
		var msg = that.game.MSG(msgText.value,to);
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
	var pId = document.createTextNode('Connid: ' + this.game.player.connid);
	
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
 
 
 
