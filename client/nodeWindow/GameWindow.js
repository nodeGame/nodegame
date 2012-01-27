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
		
		if ('undefined' !== typeof node) {
			node.log('nodeWindow: loading...');
			var gsc = node.gsc || null;
			var game = node.game || null;
		}
		else {
			node.log('nodeWindow: nodeGame not found');
		}
		
		Document.call(this);
		
		this.frame = null;
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
	
	// Overriding Document.write and Document.writeln
	GameWindow.prototype._write = Document.prototype.write;
	GameWindow.prototype._writeln = Document.prototype.writeln;

	// TODO: findLastElement
	GameWindow.prototype.findLastElement = function() {
		var el = this.frame;
		if (el) {
			el = this.frame.body || el;
		}
		else {
			el = document.body || document.lastElementChild;
		}
		return 	el;
	}
	
	GameWindow.prototype.write = function (text, root) {		
		var root = root || this.findLastElement();
		if (!root) {
			node.log('Could not determine where writing', 'ERR');
		}
		return this._write(root, text);
	};
	
	GameWindow.prototype.writeln = function (text, root, br) {
		var root = root || this.findLastElement();
		if (!root) {
			node.log('Could not determine where writing', 'ERR');
		}
		return this._writeln(root, text, br);
	};
	
	
	/**
	 * Enable / Disable all input in a container with id @id.
	 * If no container with id @id is found, then the whole document is used.
	 * 
	 * If @op is defined, all the input are set to @op, otherwise, the disabled
	 * property is toggled. (i.e. false means enable, true means disable) 
	 * 
	 */
	GameWindow.prototype.toggleInputs = function (id, op) {
		
		if ('undefined' !== typeof id) {
			var container = this.getElementById(id);
		}
		if ('undefined' === typeof container) {
			var container = this.frame.body;
		}
		
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
		return this.addElement('div', document.body, root);
	};
	
	GameWindow.prototype.generateHeader = function () {
		if (this.header) {
			this.header.innerHTML = '';
			this.header = null;
		}
		
		return this.addElement('div', this.root, 'gn_header');
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
			this.addWidget('ServerInfoDisplay');
			this.addWidget('Wall');
			//this.addWidget('GameTable');
	
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
	
	/**
	 * Returns the element with id 'id'. Looks first into the mainframe,
	 * and then into the rest of the page.
	 */
	GameWindow.prototype.getElementById = function (id) {
		var el = null;
		if (this.frame) {
			el = this.frame.getElementById(id);
		}
		if (!el) {
			el = document.getElementById(id);
		}
		return el; 
	};
	
	GameWindow.prototype.getElementsByTagName = function (tag) {
		return (this.frame) ? this.frame.getElementsByTagName(tag) : document.getElementsByTagName(tag);
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
    		//node.log('Frame Loaded correctly!');
    	}
			
		this.areLoading--;
		//node.log('ARE LOADING: ' + that.areLoading);
		if (this.areLoading === 0) {
			this.state = GameState.iss.LOADED;
			node.emit('WINDOW_LOADED');
		}
		else {
			node.log('Attempt to update state, before the window object was loaded', 'DEBUG');
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
	GameWindow.prototype.addWidget = function (w, root, options) {
		var that = this;
		
		function appendFieldset(root, options, w) {
			if (!options) return root;
			var idFieldset = options.id || w.id + '_fieldset';
			var legend = options.legend || w.legend;
			return that.addFieldset(root, idFieldset, legend, options.attributes);
		};
		
		function attachListeners (options, w) {
			if (!options || !w) return;
			for (var i in options) {
				if (options.hasOwnProperty(i)) {
					if (JSUS.in_array(i, ['onclick', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onload', 'onunload', 'onmouseover'])) {
						w.getRoot()[i] = function() {
							options[i].call(w);
						}
					}
				}			
			};
		};
		
		// Init default values
		var root = root || this.root;
		var options = options || {};
		

		// Check if it is a object (new gadget)
		// If it is a string is the name of an existing gadget
		// In this case a dependencies check is done
		if ('object' !== typeof w) {
			w = JSUS.getNestedValue(w, this.widgets);
			
			if (this.checkDependencies(w)) {
				w = new w(options);
			}
			else {
				return false;
			}
			
		}
		
		node.log('nodeWindow: registering gadget ' + w.name + ' v.' +  w.version);
		//try {
			// options exists and options.fieldset exist
			var fieldsetOptions = ('undefined' !== typeof options.fieldset) ? options.fieldset : w.fieldset; 
			root = appendFieldset(root, fieldsetOptions, w);
			w.append(root);
			// nodeGame listeners
			w.listeners();
			// user listeners
			attachListeners(options, w);
			
//		}
//		catch(e){
//			throw 'Error while loading widget ' + w.name + ': ' + e;
//		}
		
		return w;
	};
	
	// TODO: Check for version and other constraints.
	GameWindow.prototype.checkDependencies = function (w, quiet) {
		if (!w.dependencies) return;
		
		var errMsg = function (w, d) {
			var name = w.name || w.id;// || w.toString();
			node.log(d + ' not found. ' + name + ' cannot be loaded.', 'ERR');
		}
		
		var d = w.dependencies;
		for (var i in d) {
			if (d.hasOwnProperty(i)) {
				if (!window[i] && !node[i]) {
					if (!quiet) {
						errMsg(w, i);
					} 
					return false;
				}
			}
		}
		
		return true;
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
		
		if ('object' !==  typeof playerList || 'object' !== typeof toSelector) {
			return;
		}
		
		this.removeChildrenFromNode(toSelector);
		this.addStandardRecipients(toSelector);
		
		
		var opt;
		var pl = new PlayerList({}, playerList);
		
		
		try {
			pl.forEach( function(p) {
				opt = document.createElement('option');
				opt.value = p.id;
				opt.appendChild(document.createTextNode(p.name));
				toSelector.appendChild(opt);
			});
		}
		catch (e) {
			node.log('Bad Formatted Player List. Discarded. ' + p, 'ERR');
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
	
	
	GameWindow.prototype.addEventButton = function (event, text, root, id, attributes) {
		if (!event) return;
		if (!root) {
			var root = root || this.frame.body;
			root = root.lastElementChild || root;
		}
		
		var b = this.addButton(root, id, text, attributes);
		b.onclick = function () {
			node.emit(event);
		};
		return b;
	};
	
	
	/**
	 * Expose nodeGame to the global object
	 */	
	node.window = new GameWindow();
	node.window.Document = Document; // Restoring Document constructor
	
})(window.node);