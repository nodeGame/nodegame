/*
 * Add widgets to the Browser
 *
 */

// GameWindow

function GameWindow(options) {
	
	this.pl = options.pl;
	this.states = options.states;
	this.types = options.types;
	
	this.gmg = options.gmg;
	
	this.bc = new BrowserControl();
};

GameWindow.prototype.setup = function (type){

	switch (type) {
	
	case 'MONITOR':
		var root = Math.floor(Math.random()*10000);
		var rootEl = this.bc.addElement('div', document.getElementById('test'), root); // TODO: Change id
		var w = this.addWall(rootEl, 'wall'); // TODO: Careful with id;
		var cb = this.addControlBar(root); // Notice: it takes the id, not the elem
		break;
	}
};

GameWindow.prototype.addRecipientSelector = function (root, id) {

	var toSelector = document.createElement('select');
	toSelector.id = id;

	root.appendChild(toSelector);
	
	this.addStandardOptionsToSelector(toSelector);
	
	return toSelector;
};

GameWindow.prototype.addStandardOptionsToSelector = function (toSelector) {
		
	var opt = document.createElement('option');
	opt.value = 'SERVER';
	opt.appendChild(document.createTextNode('SERVER'));
	toSelector.appendChild(opt);
	
	var opt = document.createElement('option');
	opt.value = 'ALL';
	opt.appendChild(document.createTextNode('ALL'));
	toSelector.appendChild(opt);
	
};

GameWindow.prototype.populateRecipientSelector = function (toSelector, playerList) {
	
	if (typeof(playerList) !== 'object' || typeof(toSelector) !== 'object') {
		return;
	}
	
	this.bc.removeChildrenFromNode(toSelector);
	this.addStandardOptionsToSelector(toSelector);
	
	var opt;
	
	try {
		playerList.forEach( function(p) {
			
			opt = document.createElement('option');
			opt.value = p.getConnid();
			opt.appendChild(document.createTextNode(p.getName()));
			toSelector.appendChild(opt);
			}, 
			toSelector);
	}
	catch (e) {
		console.log('(E) Bad Formatted Player List. Discarded.');
	}
};

GameWindow.prototype.addWall = function (root, id) {	
	var idLogDiv = id || 'wall';
	return this.bc.addElement('pre', root, id);
};

GameWindow.prototype.addMsgBar = function (root, ids) {
	
	var PREF = 'msgbar_';
	
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
	
	var fieldset = this.bc.addFieldset(root, id);
	var sendButton = this.bc.addButton(fieldset, idButton);
	var msgText = this.bc.addTextInput(fieldset, idMsgText);
	var recipient = this.addRecipientSelector(root, idRecipient);
	
	sendButton.onclick = function() {

		// Should be within the range of valid values
		// but we should add a check
		var to = recipient.value;
		var type = 'MSG';
		var msg = that.gmg.createMSG(msgText.value,to);
		console.log(msg.stringify());
	};

	return fieldset;
	
};


GameWindow.prototype.addStateBar = function (root, ids) {
	
	var PREF = "statebar_";
	
	var idFieldset = PREF + 'fieldset'; 
	var idButton = PREF + 'sendButton';
	var idStateSel = PREF + 'msgText';
	var idRecipient = PREF + 'recipient'; 
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
		if (ids.hasOwnProperty('state')) idMsgText = ids.idStateSel;
		if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
	}
	
	var fieldset = this.bc.addFieldset(root, id);
	var sendButton = this.bc.addButton(fieldset, idButton);
	var stateSel = this.bc.addStateSelector(fieldset, idStateSel);
	var recipient = this.addRecipientSelector(root, idRecipient);
	
	sendButton.onclick = function() {

		// Should be within the range of valid values
		// but we should add a check
		var to = recipient.value;
		var type = 'STATE'; 
		
		var msg = that.gmg.createSTATE(state,to);
		console.log(msg.stringify());
	};

	return fieldset;
	
};


GameWindow.prototype.addControlBar = function (root, ids) {	
	
	var idFieldset = 'controlBar'; 
	var idButton = 'sendButton';
	var idMsgText = 'msgText';
	var idMsgType = 'msgType';
	var idStateSelector =  'stateSelector';
	var idRecipient = 'recipient';
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
		if (ids.hasOwnProperty('msgText')) idMsgText = ids.msgText;
		if (ids.hasOwnProperty('msgType')) idMsgType = ids.msgType;
		if (ids.hasOwnProperty('stateSel')) idStateSelector = ids.stateSel;
		if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
	}

	var that = this;
	
	var rootEl = document.getElementById(root);
	var fieldset = this.bc.addFieldset(rootEl, idFieldset);
	var sendButton = this.bc.addButton(fieldset, idButton);
	
	var msgText = this.bc.addTextInput(fieldset, idMsgText);
	var msgType = this.bc.addSelect(fieldset, idMsgType);
	this.bc.populateSelect(msgType, this.types);
	
	
	// Check
	this.bc.addElement('br', msgType);
	this.bc.addElement('br', msgType);
	
	var stateSelector = this.bc.addSelect(fieldset, idStateSelector);
	this.bc.populateSelect(stateSelector, this.states);
	
	var recipient = this.addRecipientSelector(fieldset,idRecipient);
	this.populateRecipientSelector(recipient, this.pl);
	
	sendButton.onclick = function() {

		// Should be within the range of valid values
		// but we should add a check
		var to = recipient.value;
		var type = msgType.value;
		
		if (type === that.gmg.types.STATE) {
			var msg = that.gmg.createSTATE(stateSelector.value,to);
		}
		else {
			var msg = that.gmg.createMSG(msgText.value,to)
		}
		
		console.log(msg.stringify());
	};

	return fieldset;
};


window.onload = function() {
	
	console.log('Starting...');
	
	// Declaring Game functions
	
	var pregame1 = function() {
		console.log('Pregame');
	};
	
	var instructions = function() {
		console.log('Instructions');
	};
	
	var postgame1 = function() {
		console.log('Postgame');
	};
	
	var endgame1 = function() {
		console.log('Game ended');
	};
	
	var function1 = function() {
		console.log('F1');
	};
		
	var function2 = function() {
		console.log('F2');
	};
	
	var function3 = function() {
		console.log('F3');
	};
	
	var waiting = function() {
		console.log('W');
	};
	
	// Assigning Functions to Loops
	
	
	var pregameloop = {
						1: pregame1
					  };
	
	var instructionsloop = {
							1: instructions
						   };	
	
	var gameloop = { // The different, subsequent phases in each round
			1: function1,
			2: waiting,
			3: function2,
			4: waiting,
			5: function3 
		};
	
	var postgameloop = {
						1: postgame1
					   };
	
	var endgameloop = {
						1: endgame1
					   };
	
	
	// Creating the game object
	
	var game = {
					name: "Peer-Review Game",
					rounds: 10, // n. of times the gameloop is repeated 
					automatic_step: false,
					loops: {
							1: pregameloop,
							2: instructionsloop,
							3: gameloop,
							4: postgameloop,
							5: endgameloop
							}	
					};
	
	
	
	// 8 Players
	var list = {
			1241234: new Player(1241234, 'mario'),
			3423423: new Player(3423423, 'luigi'),
			1893724: new Player(1893724, 'lapo'),
			9283722: new Player(9283722, 'mamma'),
			9082374: new Player(9082374, 'babbo'),
			1932000: new Player(1932000, 'zeroo'),
			8888333: new Player(8888333, 'otto'),
			7777777: new Player(7777777, 'settimio')
	};
	

	var pl = new PlayerList(list);
	
	var gmg = new GameMsgGenerator(1,'EXP',0);
	
	var options = {
					types: new GameMsgGenerator().types,
					states: new GameMsgGenerator().states,
					"pl": pl,
					"game": game,
					"gmg": gmg
				};
					
	var gm = new GameWindow(options);
	
	gm.setup('MONITOR');
	
	
	
//	var selector = gm.addRecipientSelector('recipient');
//	gm.populateSelector(selector,pl);
//	
//	gm.populateSelector(selector,pl);
//	gm.populateSelector(selector,pl);
};

