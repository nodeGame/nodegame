(function (exports) {
	
	
	/*
	 * VisualState
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.VisualState	= VisualState;
	
	GameState = node.GameState;
	JSUS = node.JSUS;
	
	VisualState.id = 'visualstate';
	VisualState.name = 'Visual State';
	VisualState.version = '0.2';
	
	VisualState.dependencies = {
		JSUS: {}
	};
	
	function VisualState (options) {
		this.id = options.id;
		this.gameLoop = node.game.gameLoop;
		
		this.fieldset = {legend: 'State'};
		
		this.root = null;		// the parent element
		
		//this.init(options);
	};
	
	VisualState.prototype.init = function (options) {};
	
	VisualState.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idTimerDiv = PREF + 'div';
		

		this.stateDiv = node.window.addDiv(root, idTimerDiv);
		this.stateDiv.innerHTML = 'Uninitialized';
		
		return root;
		
	};
		
	VisualState.prototype.listeners = function () {
		var that = this;

		node.on('STATECHANGE', function() {
			that.writeState(node.game.gameState);
		}); 
	};
	
	VisualState.prototype.writeState = function (state) {
		this.stateDiv.innerHTML =  this.gameLoop.getName(state);
	};
	
})(node.window.widgets);