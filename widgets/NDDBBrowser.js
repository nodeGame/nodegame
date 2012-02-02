(function (exports) {

	/*
	 * NDDBBrowser
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.NDDBBrowser = NDDBBrowser;
	
	JSUS = node.JSUS;
	NDDB = node.NDDB;
	TriggerManager = node.TriggerManager;
	
	NDDBBrowser.id = 'NDDBBrowser';
	NDDBBrowser.name = 'NDDBBrowser';
	NDDBBrowser.version = '0.1';
	
	NDDBBrowser.dependencies = {
		JSUS: {},
		NDDB: {},
		TriggerManager: {}
	};
	
	function NDDBBrowser (options) {
		var options = options || {};
		this.options = options;
		this.id = options.id;
		this.nddb = null;
		this.commandsDiv = document.createElement('div');
		this.init(this.options);
	};
	
	NDDBBrowser.prototype.init = function (options) {
		
		function addButtons() {
			var id = this.id;
			node.window.addEventButton(id + '_GO_TO_FIRST', '<<', this.commandsDiv, 'go_to_first');
			node.window.addEventButton(id + '_GO_TO_PREVIOUS', '<', this.commandsDiv, 'go_to_previous');
			node.window.addEventButton(id + '_GO_TO_NEXT', '>', this.commandsDiv, 'go_to_next');
			node.window.addEventButton(id + '_GO_TO_LAST', '>>', this.commandsDiv, 'go_to_last');
		};
		addButtons.call(this);
		this.tm = new TriggerManager();
		this.tm.init(options.triggers);
		this.nddb = options.nddb || new NDDB();
	};
	
	NDDBBrowser.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.commandsDiv);
		return root;
	};
	
	NDDBBrowser.prototype.getRoot = function (root) {
		return this.commandsDiv;
	};
	
	NDDBBrowser.prototype.add = function (o) {
		return this.nddb.insert(o);
	};
	
	NDDBBrowser.prototype.sort = function (key) {
		return this.nddb.sort(key);
	};
	
	NDDBBrowser.prototype.addTrigger = function (trigger) {
		return this.tm.addTrigger(trigger);
	};
	
	NDDBBrowser.prototype.removeTrigger = function (trigger) {
		return this.tm.removeTrigger(trigger);
	};
	
	NDDBBrowser.prototype.resetTriggers = function () {
		return this.tm.resetTriggers();
	};
	
	NDDBBrowser.prototype.listeners = function() {
		var that = this;
		var id = this.id;
		
		node.on(id + '_GO_TO_FIRST', function() {
			var el = that.tm.pullTriggers(that.nddb.first());
			if (el) node.emit(id + '_GOT', el);
			console.log('first');
			console.log(el);
		});
		
		node.on(id + '_GO_TO_PREVIOUS', function() {
			var el = that.tm.pullTriggers(that.nddb.previous());
			if (el) node.emit(id + '_GOT', el); 
			console.log('previous');
			console.log(el);
			
		});
		
		node.on(id + '_GO_TO_NEXT', function() {
			var el = that.tm.pullTriggers(that.nddb.next());
			if (el) node.emit(id + '_GOT', el); 
			console.log('next');
			console.log(el);
		});

		node.on(id + '_GO_TO_LAST', function() {
			var el = that.tm.pullTriggers(that.nddb.last());
			if (el) node.emit(id + '_GOT', el);
			console.log('last');
			console.log(el);
		});
	};
	
	
})(node.window.widgets);