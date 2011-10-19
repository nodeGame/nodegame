/*
 * DataBar
 * 
 * Sends DATA msgs
 * 
 */

function DataBar(id) {
	
	this.game = node.game;
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