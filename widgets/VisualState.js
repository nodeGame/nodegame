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
	Table = node.window.Table;
	
	VisualState.id = 'visualstate';
	VisualState.name = 'Visual State';
	VisualState.version = '0.2';
	
	VisualState.dependencies = {
		JSUS: {},
		Table: {}
	};
	
	function VisualState (options) {
		this.id = options.id;
		this.gameLoop = node.game.gameLoop;
		
		this.fieldset = {legend: 'State'};
		
		this.root = null;		// the parent element
		this.table = new Table();
		//this.init(options);
	};
	
	VisualState.prototype.init = function (options) {};
	
	VisualState.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		
		root.appendChild(this.table.table);
		
		this.writeState();
		return root;
	};
		
	VisualState.prototype.listeners = function () {
		var that = this;
		node.on('STATECHANGE', function() {
			that.writeState();
		}); 
	};
	
	VisualState.prototype.writeState = function () {
		var state = false;
		var pr = false;
		var nx = false;
		
		var miss = '-';
		
		if (node.game && node.game.gameState) {
			var state = this.gameLoop.getName(node.game.gameState) || miss;
			var pr = this.gameLoop.getName(node.game.previous()) || miss;
			var nx = this.gameLoop.getName(node.game.next()) || miss;
		}
		else {
			var state = 'Uninitialized';
			var pr = miss;
			var nx = miss;
		}
		this.table.clear(true);

		this.table.addRow(['Previous: ', pr]);
		this.table.addRow(['Current: ', state]);
		this.table.addRow(['Next: ', nx]);
	
		var t = this.table.select('y', '=', 2);
		t.addClass('strong');
		t.select('x','=',0).addClass('underline');
		this.table.parse();
	};
	
})(node.window.widgets);