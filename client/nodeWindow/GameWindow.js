(function(node) {
	/*!
	 * GameWindow
	 */
	
	var Player = node.Player;
	var PlayerList = node.PlayerList;
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var GameMsgGenerator = node.GameMsgGenerator;
	
	var Document = node.window.Document;
	
	GameWindow.prototype = new Document();
	GameWindow.prototype.constructor = GameWindow;
	
	// The widgets container
	GameWindow.prototype.widgets = {};
	
	function GameWindow() {
		
		console.log('nodeWindow: loading...');
		
		if ('undefined' !== typeof node) {
			var gsc = node.gsc || null;
			var game = node.game || null;
		}
		else {
			console.log('nodeWindow: nodeGame not found');
		}
		
		Document.call(this);
		this.mainframe = 'mainframe';
		this.root = this.generateRandomRoot();
		
		
		this.state = GameState.iss.LOADED;
		this.areLoading = 0; 
		
		var that = this;
		
		var listeners = function() {
			
			node.on('HIDE', function(id) {
				var el = that.getElementById(id);
				if (!el) {
					node.log('Cannot hide element ' + id);
					return;
				}
				el.style.visibility = 'hidden';    
			});
			
			node.on('SHOW', function(id) {
				var el = that.getElementById(id);
				if (!el) {
					node.log('Cannot show element ' + id);
					return;
				}
				el.style.visibility = 'visible'; 
			});
			
			node.on('TOGGLE', function(id) {
				var el = that.getElementById(id);
				if (!el) {
					node.log('Cannot toggle element ' + id);
					return;
				}
				if (el.style.visibility === 'visible') {
					el.style.visibility = 'hidden';
				}
				else {
					el.style.visibility = 'visible';
				}
			});
			
			// Disable all the input forms found within a given id element
			node.on('INPUT_DISABLE', function(id) {
				that.toggleInputs(id, true);			
			});
			
			// Disable all the input forms found within a given id element
			node.on('INPUT_ENABLE', function(id) {
				that.toggleInputs(id, false);
			});
			
			// Disable all the input forms found within a given id element
			node.on('INPUT_TOGGLE', function(id) {
				that.toggleInputs(id);
			});
			
			
		}();
	};
	
	/**
	 * Enable / Disable all input in a container with id @id.
	 * If no container with id @id is found, then the whole document is used.
	 * 
	 * If @op is defined, all the input are set to @op, otherwise, the disabled
	 * property is toggled. (i.e. false means enable, true means disable) 
	 * 
	 */
	GameWindow.prototype.toggleInputs = function(id, op) {
		
		var container = this.getElementById(id) || this;			
		if (!container) return;

		var inputTags = ['button', 'select', 'textarea', 'input'];

		var j=0;
		for (;j<inputTags.length;j++) {
			var all = container.getElementsByTagName(inputTags[j]);
			var i=0;
			var max = all.length;
			for (; i < max; i++) {
				//node.log(all[i]);
				
				// If op is defined do that
				var state = op;
				
				// Otherwise toggle
				if (!state) {
					state = all[i].disabled ? false : true;
				}
				
				all[i].disabled = state;
			}
		}
	};
	
	GameWindow.prototype.generateRandomRoot = function () {
		// We assume that the BODY element always exists
		// TODO: Check if body element does not exist and add it
		var root = Math.floor(Math.random()*10000);
		return rootEl = this.addElement('div', document.body, root);
	};
	
	GameWindow.prototype.generateHeader = function () {
		if (this.header) {
			this.header.innerHTML = '';
			this.header = null;
		}
		
		return headerEl = this.addElement('div', this.root, 'gn_header');
	};
	
	GameWindow.prototype.setup = function (type){
	
		
		switch (type) {
		
		case 'MONITOR':
			
			// TODO: Check this
			node.node.removeListener('in.STATE');
			
			this.addWidget('NextPreviousState');
			this.addWidget('GameSummary');
			this.addWidget('StateDisplay');
			this.addWidget('StateBar');
			this.addWidget('DataBar');
			this.addWidget('MsgBar');
			this.addWidget('GameBoard');
			this.addWidget('Wall');
	
			break;
		
			
		case 'PLAYER':
			
			//var maincss		= this.addCSS(this.root, 'style.css');
			this.header 	= this.generateHeader();
		    var mainframe 	= this.addIFrame(this.root,'mainframe');
		   

		    this.addWidget('WaitScreen');
		    
			break;
		}
		this.frame = window.frames[this.mainframe]; // there is no document yet
	};
	
	
	GameWindow.prototype.getElementById = function (id) {
		return this.frame.getElementById(id);
	};
	
	GameWindow.prototype.getElementsByTagName = function (tag) {
		return this.frame.getElementsByTagName(tag);
	};
	
	GameWindow.prototype.load = GameWindow.prototype.loadFrame = function (url, func, frame) {
 		
 		this.state = GameState.iss.LOADING;
 		this.areLoading++; // keep track of nested call to loadFrame
 		
		var frame =  frame || this.mainframe;
 		var that = this;	
 				
 		// First add the onload event listener
		var iframe = document.getElementById(frame);
		iframe.onload = function() {
			that.updateStatus(func,frame);
		};
	
		// Then update the frame location
		window.frames[frame].location = url;
 						
 	};
 	
 	
 	GameWindow.prototype.updateStatus = function(func, frame) {
 		// Update the reference to the frame obj
		this.frame = window.frames[frame].document;
			
		if (func) {
    		func.call(node.game); // TODO: Pass the right this reference
    		//console.log('Frame Loaded correctly!');
    	}
			
		this.areLoading--;
		//console.log('ARE LOADING: ' + that.areLoading);
		if (this.areLoading === 0) {
			this.state = GameState.iss.LOADED;
			node.emit('WINDOW_LOADED');
		}
		else {
			console.log('still gw loading');
		}
 	};
 		
	GameWindow.prototype.getFrame = function() {
		return this.frame = window.frames['mainframe'].document;
	};
	
	
	// Header
	
	GameWindow.prototype.addHeader = function (root, id) {
		return this.addDiv(root,id);
	};
	
	/**
	 * Add a widget to the browser window.
	 * TODO: If an already existing id is provided, the existing element is deleted.
	 */
	GameWindow.prototype.addWidget = function (g, root, options) {
		var that = this;
		//console.log(this.widgets);
		
		function appendFieldset(root, options, g) {
			if (!options) return root;
			var idFieldset = options.id || g.id + '_fieldset';
			var legend = options.legend || g.legend;
			return that.addFieldset(root, idFieldset, legend, options.attributes);
		};
		
		// Init default values
		var root = root || this.root;
		var options = options || {};
		
		// TODO: remove the eval
		// Check if it is a object (new gadget)
		// If it is a string is the name of an existing gadget
		if ('object' !== typeof g) {
			g = JSUS.getNestedValue(g,this.widgets);
			g = new g(options);
			
//			var tokens = g.split('.');
//			var i = 0;
//			var strg = 'g = new this.widgets';
//			for (;i<tokens.length;i++) {
//				strg += '[\''+tokens[i]+'\']';
//			}
//			strg+='(options);';
//			//console.log(strg);
//			eval(strg);
//			//g = new this.widgets[tokens](options);
		}
		
		console.log('nodeWindow: registering gadget ' + g.name + ' v.' +  g.version);
		try {
			// options exists and options.fieldset exist
			var fieldsetOptions = (options && 'undefined' !== typeof options.fieldset) ? options.fieldset : g.fieldset; 
			root = appendFieldset(root,fieldsetOptions,g);
			g.append(root);
			g.listeners();
		}
		catch(e){
			throw 'Error while loading widget ' + g.name + ': ' + e;
		}
		
		return g;
	};
	
	// Recipients
	
	GameWindow.prototype.addRecipientSelector = function (root, id) {
	
		var toSelector = document.createElement('select');
		toSelector.id = id;
	
		root.appendChild(toSelector);
		
		this.addStandardRecipients(toSelector);
		
		//this.toSels.push(toSelector);
		
		return toSelector;
	};
	
	GameWindow.prototype.addStandardRecipients = function (toSelector) {
			
		var opt = document.createElement('option');
		opt.value = 'ALL';
		opt.appendChild(document.createTextNode('ALL'));
		toSelector.appendChild(opt);
		
		var opt = document.createElement('option');
		opt.value = 'SERVER';
		opt.appendChild(document.createTextNode('SERVER'));
		toSelector.appendChild(opt);
		
	
		
	};
	
	GameWindow.prototype.populateRecipientSelector = function (toSelector, playerList) {
		
		if (typeof(playerList) !== 'object' || typeof(toSelector) !== 'object') {
			return;
		}
		
		this.removeChildrenFromNode(toSelector);
		this.addStandardRecipients(toSelector);
		
		
		var opt;
		var pl = new PlayerList(playerList);
		
		
		try {
			pl.forEach( function(p) {
				opt = document.createElement('option');
				opt.value = p.id;
				opt.appendChild(document.createTextNode(p.name));
				toSelector.appendChild(opt);
				}, 
				toSelector);
		}
		catch (e) {
			console.log('(E) Bad Formatted Player List. Discarded. ' + p);
		}
	};
	
	// Actions
	
	
	GameWindow.prototype.addActionSelector = function (root, id) {
	
		var actionSelector = document.createElement('select');
		actionSelector.id = id;
	
		root.appendChild(actionSelector);
		this.populateSelect(actionSelector, node.actions);
		
		return actionSelector;
	};
	
	// States
	
	GameWindow.prototype.addStateSelector = function (root, id) {
		var stateSelector = this.addTextInput(root,id);
		return stateSelector;
	};
	
	
	/**
	 * Expose nodeGame to the global object
	 */	
	node.window = new GameWindow();
	node.window.Document = Document; // Restoring Document constructor
	
})(window.node);