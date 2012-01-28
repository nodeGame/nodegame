(function (exports) {
	
	/*
	 * StateBar
	 * 
	 * Sends STATE msgs
	 */
	
	// TODO: Introduce rules for update: other vs self
	
	exports.StateBar = StateBar;	
	
	StateBar.id = 'statebar';
	StateBar.name = 'State Bar';
	StateBar.version = '0.3';
	
	function StateBar (options) {
		this.id = options.id;
		
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
		
		var fieldset 	= node.window.addFieldset(root, idFieldset, 'Change Game State');
		var sendButton 	= node.window.addButton(fieldset, idButton);
		var stateSel 	= node.window.addStateSelector(fieldset, idStateSel);
		this.actionSel	= node.window.addActionSelector(fieldset, idActionSel);
		this.recipient 	= node.window.addRecipientSelector(fieldset, idRecipient);
		
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
				
				var state = new node.GameState({
													state: state,
													step: step,
													round: round
				});
				
				// Self Update
				if (to === 'ALL') {
					var stateEvent = node.IN + node.actions.SAY + '.STATE';
					var stateMsg = node.gsc.gmg.createSTATE(stateEvent, state);
					node.emit(stateEvent, stateMsg);
				}
				
				// Update Others
				var stateEvent = node.OUT + that.actionSel.value + '.STATE';
				node.emit(stateEvent,state,to);
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
			node.window.populateRecipientSelector(that.recipient,msg.data);
		}); 
	}; 
})(node.window.widgets);