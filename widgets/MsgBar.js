(function (exports) {

	
	/*!
	 * MsgBar
	 * 
	 */
	
	exports.MsgBar	= MsgBar;
		
	MsgBar.id = 'msgbar';
	MsgBar.name = 'Msg Bar';
	MsgBar.version = '0.3';
	
	function MsgBar (options) {
		
		this.game = node.game;
		this.id = options.id;
		
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
		
		var fieldset = node.window.addFieldset(root, idFieldset, 'Send Msg To Players');
		var sendButton = node.window.addButton(fieldset, idButton);
		var msgText = node.window.addTextInput(fieldset, idMsgText);
		this.recipient = node.window.addRecipientSelector(fieldset, idRecipient);
		
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
			node.window.populateRecipientSelector(that.recipient,msg.data);
		
		}); 
	};
})(node.window.widgets);