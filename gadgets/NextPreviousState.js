(function (exports) {
	
	/*!
	 * NextPreviousState
	 * 
	 * Step back and forth in the gameState
	 * 
	 */
	
	exports.NextPreviousState =	NextPreviousState;
		
	function NextPreviousState(id) {
		this.game = node.game;
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
		
		var fieldset 	= node.window.addFieldset(root, idFieldset, 'Rew-Fwd');
		var rew 		= node.window.addButton(fieldset, idRew, '<<');
		var fwd 		= node.window.addButton(fieldset, idFwd, '>>');
		
		
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

})(node.window.gadgets);