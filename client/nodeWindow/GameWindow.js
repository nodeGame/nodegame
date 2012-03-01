(function (node) {
	
	/**
	 * 
	 * nodeGame-window: GameWindow
	 * 
	 * GameWindow provides a handy API to interface nodeGame with the 
	 * browser window.
	 * 
	 * Creates a custom root element inside the HTML page, and insert an
	 * iframe element inside it.
	 * 
	 * Dynamic content can be loaded inside the iframe without losing the
	 * javascript state inside the page.
	 * 
	 * Loads and unloads special javascript/HTML snippets, called widgets,
	 * in the page.
	 * 
	 * Defines a number of pre-defined profiles associated with special
	 * configuration of widgets.
	 * 
	 * Depends on nodeGame-client and JSUS.
	 * 
	 */
	
	var JSUS = node.JSUS;
	
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
	
	/**
	 * The constructor performs the following operations:
	 * 
	 * 		- creates a root div element (this.root)
	 * 		- creates an iframe element inside the root element	(this.frame)
	 * 		- defines standard event listeners for showing and hiding elements
	 * 
	 */
	function GameWindow() {
		
		if ('undefined' !== typeof node) {
			node.log('nodeWindow: loading...');
			var gsc = node.gsc || null;
			var game = node.game || null;
		}
		else {
			node.log('nodeWindow: nodeGame not found', 'ERR');
		}
		
		Document.call(this);
		
		this.frame = null; // contains an iframe 
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
	 * Setups the page with a predefined configuration of widgets.
	 * 
	 */
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
	 * Returns the screen of the game, i.e. the innermost element
	 * inside which to display content. 
	 * 
	 * In the following order the screen can be:
	 * 
	 * 		- the body element of the iframe 
	 * 		- the document element of the iframe 
	 * 		- the body element of the document 
	 * 		- the last child element of the document
	 * 
	 */
	GameWindow.prototype.getScreen = function() {
		var el = this.frame;
		if (el) {
			el = this.frame.body || el;
		}
		else {
			el = document.body || document.lastElementChild;
		}
		return 	el;
	}
	
	/**
	 * Returns the document element of the iframe of the game.
	 * 
	 * @TODO: What happens if the mainframe is not called mainframe?
	 */
	GameWindow.prototype.getFrame = function() {
		return this.frame = window.frames['mainframe'].document;
	};
	
	
	/**
	 * Loads content from an uri (remote or local) into the iframe, 
	 * and after it is loaded executes the callback function. 
	 * 
	 * The third parameter is the id of the frame in which to load the content. 
	 * If it is not specified, the default iframe of the game is assumed.
	 * 
	 * Warning: Security policies may block this methods, if the 
	 * content is coming from another domain.
	 * 
	 */
	GameWindow.prototype.load = GameWindow.prototype.loadFrame = function (url, func, frame) {
		if (!url) return;
 		
 		this.state = GameState.iss.LOADING;
 		this.areLoading++; // keep track of nested call to loadFrame
 		
		var frame =  frame || this.mainframe;
 		var that = this;	
 				
 		// First add the onload event listener
		var iframe = document.getElementById(frame);
		iframe.onload = function () {
			that.updateStatus(func, frame);
		};
	
		// Then update the frame location
		window.frames[frame].location = url;
		// Adding a reference to nodeGame also in the iframe
		window.frames[frame].window.node = node;
//		console.log('the frame just as it is');
//		console.log(window.frames[frame]);
		// Experimental
//		if (url === 'blank') {
//			window.frames[frame].src = this.getBlankPage();
//			window.frames[frame].location = '';
//		}
//		else {
//			window.frames[frame].location = url;
//		}
		
 						
 	};
 	
 	
 	GameWindow.prototype.updateStatus = function(func, frame) {
 		// Update the reference to the frame obj
		this.frame = window.frames[frame].document;
			
		if (func) {
    		func.call(node.game); // TODO: Pass the right this reference
    		//node.log('Frame Loaded correctly!');
    	}
			
		this.areLoading--;
		//console.log('ARE LOADING: ' + this.areLoading);
		if (this.areLoading === 0) {
			this.state = GameState.iss.LOADED;
			node.emit('WINDOW_LOADED');
		}
		else {
			node.log('Attempt to update state, before the window object was loaded', 'DEBUG');
		}
 	};
 		
 	/**
 	 * Retrieves, instantiates and returns the specified widget.
 	 * 
 	 * It can attach standard javascript listeners to the root element of
 	 * the widget if specified in the options.
 	 * 
 	 * @TODO: add supports for any listener. Maybe requires some refactoring.
 	 * @TODO: add example.
 	 * 
 	 * The dependencies are checked, and if the conditions are not met, 
 	 * returns FALSE.
 	 * 
 	 * @see GameWindow.addWidget
 	 * 
 	 */
 	GameWindow.prototype.getWidget = function (w_str, options) {
		if (!w_str) return;
		var that = this;
		var options = options || {};
		
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
		
		var w = JSUS.getNestedValue(w_str, this.widgets);
		
		node.log('nodeWindow: registering gadget ' + w.name + ' v.' +  w.version);
		
		if (!w) {
			node.log('Widget ' + w_str + ' not found.', 'ERR');
			return;
		}
		
		if (! this.checkDependencies(w)) return false;
		
		var id = ('undefined' !== typeof options.id) ? options.id : w.id; 
		options.id = this.generateUniqueId(id);
		
		
		w = new w(options);
	
		
		try {
	
			// nodeGame listeners
			w.listeners();
			// user listeners
			attachListeners(options, w);
			}
			catch(e){
				throw 'Error while loading widget ' + w.name + ': ' + e;
			}
		return w;
	};
	
	/**
	 * Appends a widget to the specified root element. If no root element
	 * is specified the widget is append to the global root. 
	 * 
	 * The first parameter can be string representing the name of the widget or 
	 * a valid widget already loaded, for example through GameWindow.getWidget. 
	 * In the latter case, dependencies are checked, and it returns FALSE if
	 * conditions are not met.
	 * 
	 * It automatically creates a fieldset element around the widget if 
	 * requested by the internal widget configuration, or if specified in the
	 * options parameter.
	 * 
 	 * @see GameWindow.getWidget
	 * 
	 */
	GameWindow.prototype.addWidget = function (w, root, options) {
		if (!w) return;
		var that = this;
		
		function appendFieldset(root, options, w) {
			if (!options) return root;
			var idFieldset = options.id || w.id + '_fieldset';
			var legend = options.legend || w.legend;
			return that.addFieldset(root, idFieldset, legend, options.attributes);
		};
		
		
		// Init default values
		var root = root || this.root;
		var options = options || {};
		

		// Check if it is a object (new gadget)
		// If it is a string is the name of an existing gadget
		// In this case a dependencies check is done
		if ('object' !== typeof w) w = this.getWidget(w, options);
		if (!w) return false;	
		
		// options exists and options.fieldset exist
		var fieldsetOptions = ('undefined' !== typeof options.fieldset) ? options.fieldset : w.fieldset; 
		root = appendFieldset(root, fieldsetOptions, w);
		w.append(root);

		return w;
	};
	
	/**
	 * Checks if all the necessary objects are already loaded and returns TRUE,
	 * or FALSE otherwise.
	 * 
	 * TODO: Check for version and other constraints.
	 * 
	 * @see GameWindow.getWidgets
	 * 
	 */ 
	GameWindow.prototype.checkDependencies = function (w, quiet) {
		if (!w.dependencies) return true;
		
		var errMsg = function (w, d) {
			var name = w.name || w.id;// || w.toString();
			node.log(d + ' not found. ' + name + ' cannot be loaded.', 'ERR');
		}
		
		var parents = [window, node, node.window.widgets, node.window];
		
		var d = w.dependencies;
		for (var lib in d) {
			if (d.hasOwnProperty(lib)) {
				var found = false;
				for (var i=0; i<parents.length; i++) {
					if (JSUS.getNestedValue(lib, parents[i])) {
						var found = true;
						break
					}
				}
				if (!found) {	
					if (!quiet) errMsg(w, lib);
					return false;
				}
			
			}
		}
		return true;
	};
	
	
	// @TODO: use the prototype chain instead
	// Overriding Document.write and Document.writeln
	GameWindow.prototype._write = Document.prototype.write;
	GameWindow.prototype._writeln = Document.prototype.writeln;
	
	/**
	 * Appends a text string, an HTML node or element inside
	 * the specified root element. 
	 * 
	 * If no root element is specified, the default screen is 
	 * used.
	 * 
	 * @see GameWindow.writeln
	 * 
	 */
	GameWindow.prototype.write = function (text, root) {		
		var root = root || this.getScreen();
		if (!root) {
			node.log('Could not determine where writing', 'ERR');
			return false;
		}
		return this._write(root, text);
	};
	
	/**
	 * Appends a text string, an HTML node or element inside
	 * the specified root element, and adds a break element
	 * immediately afterwards.
	 * 
	 * If no root element is specified, the default screen is 
	 * used.
	 * 
	 * @see GameWindow.write
	 * 
	 */
	GameWindow.prototype.writeln = function (text, root, br) {
		var root = root || this.getScreen();
		if (!root) {
			node.log('Could not determine where writing', 'ERR');
			return false;
		}
		return this._writeln(root, text, br);
	};
	
	
	/**
	 * Enables / Disables all input in a container with id @id.
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
				
				// If op is defined do that
				// Otherwise toggle
				state = ('undefined' !== typeof op) ? op 
													: all[i].disabled ? false 
																	  : true;
				
				if (state) {
					all[i].disabled = state;
				}
				else {
					all[i].removeAttribute('disabled');
				}
			}
		}
	};
	
	/**
	 * Creates a div element with a global random unique id 
	 * and in tries to append it in the following order to:
	 * 
	 * 		- the specified root element
	 * 		- the body element
	 * 		- the last element of the document
	 * 
	 * If it fails, it creates a new body element, appends it
	 * to the document, and then appends the div element to it.
	 * 
	 * Returns the newly created root element.
	 * 
	 */
	GameWindow.prototype.generateRandomRoot = function (root) {
		var id = this.generateUniqueId();
		var root = root || document.body || document.lastElementChild;
		if (!root) {
			this.addElement('body', document);
			root = document.body;
		}
		return this.addElement('div', root, id);
	};
	
	/**
	 * Creates and adds a container div with id 'gn_header' to 
	 * the root element. 
	 * 
	 * If an header element has already been created, deletes it, 
	 * and creates a new one.
	 * 
	 * @TODO: Should be always added as first child
	 * 
	 */
	GameWindow.prototype.generateHeader = function () {
		if (this.header) {
			this.header.innerHTML = '';
			this.header = null;
		}
		
		return this.addElement('div', this.root, 'gn_header');
	};
	
	
	
	/**
	 * Returns the element with id 'id'. Looks first into the iframe,
	 * and then into the rest of the page.
	 * 
	 * @see GameWindow.getElementsByTagName
	 */
	GameWindow.prototype.getElementById = function (id) {
		var el = null; // @TODO: should be init to undefined instead ?
		if (this.frame && this.frame.getElementById) {
			el = this.frame.getElementById(id);
		}
		if (!el) {
			el = document.getElementById(id);
		}
		return el; 
	};
	
	/**
	 * Returns a collection of elements with the tag name equal to @tag . 
	 * Looks first into the iframe and then into the rest of the page.
	 * 
	 * @see GameWindow.getElementById
	 * 
	 */
	GameWindow.prototype.getElementsByTagName = function (tag) {
		// @TODO: Should that be more similar to GameWindow.getElementById
		return (this.frame) ? this.frame.getElementsByTagName(tag) : document.getElementsByTagName(tag);
	};
	
	
	
	
	// Header
//	GameWindow.prototype.addHeader = function (root, id) {
//		return this.addDiv(root,id);
//	};
	
	/**
	 * Creates an HTML select element already populated with the 
	 * of the data of other players.
	 * 
	 * @TODO: adds options to control which players/servers to add.
	 * 
	 * @see GameWindow.addRecipientSelector
	 * @see GameWindow.addStandardRecipients
	 * @see GameWindow.populateRecipientSelector
	 * 
	 */
	GameWindow.prototype.getRecipientSelector = function (id) {
		var toSelector = document.createElement('select');
		if ('undefined' !== typeof id) {
			toSelector.id = id;
		}
		this.addStandardRecipients(toSelector);
		return toSelector;
	};
	
	/**
	 * Appends a RecipientSelector element to the specified root element.
	 * 
	 * Returns FALSE if no valid root element is found.
	 * 
	 * @TODO: adds options to control which players/servers to add.
	 * 
	 * @see GameWindow.addRecipientSelector
	 * @see GameWindow.addStandardRecipients 
	 * @see GameWindow.populateRecipientSelector
	 * 
	 */
	GameWindow.prototype.addRecipientSelector = function (root, id) {
		if (!root) return false;
		var toSelector = this.getRecipientSelector(id);
		return root.appendChild(toSelector);		
	};
	
	/**
	 * Adds an ALL and a SERVER option to a specified select element.
	 * 
	 * @TODO: adds options to control which players/servers to add.
	 * 
	 * @see GameWindow.populateRecipientSelector
	 * 
	 */
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
	
	/**
	 * Adds all the players from a specified playerList object to a given
	 * select element.
	 * 
	 * @see GameWindow.addStandardRecipients 
	 * 
	 */
	GameWindow.prototype.populateRecipientSelector = function (toSelector, playerList) {
		
		if ('object' !==  typeof playerList || 'object' !== typeof toSelector) return;
		
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
	
	/**
	 * Creates an HTML select element with all the predefined actions
	 * (SET,GET,SAY,SHOW*) as options and returns it.
	 * 
	 * *not yet implemented
	 * 
	 * @see GameWindow.addActionSelector
	 * 
	 */
	GameWindow.prototype.getActionSelector = function (id) {
		var actionSelector = document.createElement('select');
		if ('undefined' !== typeof id ) {
			actionSelector.id = id;
		}
		this.populateSelect(actionSelector, node.actions);
		return actionSelector;
	};
	
	/**
	 * Appends an ActionSelector element to the specified root element.
	 * 
	 * @see GameWindow.getActionSelector
	 * 
	 */
	GameWindow.prototype.addActionSelector = function (root, id) {
		if (!root) return;
		var actionSelector = this.getActionSelector(id);
		return root.appendChild(actionSelector);
	};
	
	/**
	 * @experimental
	 * 
	 * Creates an HTML text input element where a nodeGame state can
	 * be inserted. This method should be improved to automatically
	 * show all the available states of a game.
	 * 
	 * @see GameWindow.addActionSelector
	 */
	GameWindow.prototype.getStateSelector = function (id) {
		var stateSelector = this.getTextInput(id);
		return stateSelector;
	};
	
	/**
	 * @experimental
	 * 
	 * Appends a StateSelector to the specified root element.
	 * 
	 * @see GameWindow.getActionSelector
	 * 
	 */
	GameWindow.prototype.addStateSelector = function (root, id) {
		if (!root) return;
		var stateSelector = this.getStateSelector(id);
		root
		return stateSelector;
	};
	
	/**
	 * Creates an HTML button element that will emit the specified
	 * nodeGame event when clicked and returns it.
	 * 
	 */
	GameWindow.prototype.getEventButton = function (event, text, id, attributes) {
		if (!event) return;
		var b = this.getButton(id, text, attributes);
		b.onclick = function () {
			node.emit(event);
		};
		return b;
	};
	
	/**
	 * Adds an EventButton to the specified root element.
	 * 
	 * If no valid root element is provided, it is append as last element
	 * in the current screen.
	 * 
	 * @see GameWindow.getEventButton
	 * 
	 */
	GameWindow.prototype.addEventButton = function (event, text, root, id, attributes) {
		if (!event) return;
		if (!root) {
//			var root = root || this.frame.body;
//			root = root.lastElementChild || root;
			var root = this.getScreen();
		}
		var eb = this.getEventButton(event, text, id, attributes);
		return root.appendChild(eb);
	};
	
	/**
	 * Overrides JSUS.DOM.generateUniqueId
	 * 
	 * @experimental
	 * @TODO: it is not always working fine. 
	 * @TODO: fix doc
	 * 
	 */
	GameWindow.prototype.generateUniqueId = function (prefix) {
		var id = '' + (prefix || JSUS.randomInt(0, 1000));
		var found = this.getElementById(id);
		
		while (found) {
			id = '' + prefix + '_' + JSUS.randomInt(0, 1000);
			found = this.getElementById(id);
		}
		return id;
	};
	
	/**
	 * Expose nodeGame to the global object
	 */	
	node.window = new GameWindow();
	node.window.Document = Document; // Restoring Document constructor
	
})(window.node);