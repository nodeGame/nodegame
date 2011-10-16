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
			
			var state = node.create.GameState({
												state: state,
												step: step,
												round: round
			});
			
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