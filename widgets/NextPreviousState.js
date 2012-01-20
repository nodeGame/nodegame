(function (exports) {
	
	/*!
	 * NextPreviousState
	 * 
	 * Step back and forth in the gameState
	 * 
	 */
	
	// TODO: Introduce rules for update: other vs self
	
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
	
		var updateState = function (state) {
			if (state) {
				var stateEvent = node.IN + node.actions.SAY + '.STATE';
				var stateMsg = node.gsc.gmg.createSTATE(stateEvent, state);
				// Self Update
				node.emit(stateEvent, stateMsg);
				
				// Update Others
				stateEvent = node.OUT + node.actions.SAY + '.STATE';
				node.emit(stateEvent, state, 'ALL');
			}
			else {
				node.log('No next/previous state. Not sent', 'ERR');
			}
		};
		
		fwd.onclick = function() {
			updateState(that.game.next());
		}
			
		rew.onclick = function() {
			updateState(that.game.previous());
		}
		
		return fieldset;
	};
	
	NextPreviousState.prototype.listeners = function () {}; 

})(node.window.widgets);