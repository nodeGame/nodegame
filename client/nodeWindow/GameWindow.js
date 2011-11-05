(function(node) {
	/*!
	 * GameWindow
	 */
	
	var Player = node.Player;
	var PlayerList = node.PlayerList;
	var GameState = node.GameState;
	
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
	};
	
	GameWindow.prototype.generateRandomRoot = function () {
		// We assume that the BODY element always exists
		// TODO: Check if body element does not exist and add it
		var root = Math.floor(Math.random()*10000);
		var rootEl = this.addElement('div', document.body, root);
		return rootEl;
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
			
			var maincss		= this.addCSS(this.root, 'style.css');
		    var mainframe 	= this.addIFrame(this.root,'mainframe');
		    
			this.addWidget('WaitScreen');
		    
			break;
		}
		
		this.frame = window.frames[this.mainframe].document;
	};
	
	
	GameWindow.prototype.getElementById = function (id) {
		return this.frame.getElementById(id);
	};
	
//	1. Load a Frame into the mainframe or other specified frame
//	2. Wait until the frame is loaded
//	3. Put a reference of the loaded frame.document into this.frame
//	4. Exec the callback function
//	GameWindow.prototype.loadFrame = function (url, func, frame) {
//		var frame = this.frame || frame;
//		var that = this;
//		frame.location = url;
//	
//		frame.onload = function() {
//			console.log('LOADING');
//	    	if (func) {
//	    		func.call(); // TODO: Pass the right this reference
//	    		console.log('Frame Loaded correctly!');
//	    	}
//
//		};
//	};
//	
	
	// TODO: frames are loaded taking into account also the path of the game in the server
	
	// FAKE ONLOAD  TODO: try to make it work with onload
//	GameWindow.prototype.loadFrame = function (url, func, frame) {
//		var that = this;	
//		var frame = frame || this.frame;
//		frame.location = url;
//		
//		var ii=0;
//		var isFrameLoaded = setInterval( function() {
//			if (frame.document.readyState === 'complete') {
//			//if (window.frames[frame].document.readyState === 'complete') {
//			//if (window.frames[frame].document) {	
//				clearInterval(isFrameLoaded);
//				//console.log('Interval cleared');
//				
//				// ???
//				//frame = window.frames[frame].document;
//				if (func) {
//		    		func.call(); // TODO: Pass the right this reference
//		    		//console.log('Frame Loaded correctly!');
//		    	}
//			}
//			else {
//				console.log('not yet ' + frame.document.readyState);
//			}
//		}, 100);
//	};
 	
	
 	// FAKE ONLOAD  TODO: try to make it work with onload
 	GameWindow.prototype.loadFrame = function (url, func, frame) {
 		
 		this.state = GameState.iss.LOADING;
 		this.areLoading++; // keep track of nested call to loadFrame
 		
		var frame =  frame || this.mainframe;
 		var that = this;	
 		
		window.frames[frame].location = url;
		//window.frames[frame].location.href = url;
		
		// HERE!
		this.frame = window.frames[frame].document;
 		var ii=0;
 		var isFrameLoaded = setInterval( function() {
			if (window.frames[frame].document.readyState === 'complete') {
 				clearInterval(isFrameLoaded);
				//console.log('Interval cleared');
				that.frame = window.frames[frame].document;
 				if (func) {
 		    		func.call(); // TODO: Pass the right this reference
		    		//console.log('Frame Loaded correctly!');
 		    	}
 				
 				that.areLoading--;
 				//console.log('ARE LOADING: ' + that.areLoading);
 				if (that.areLoading === 0) {
 					that.state = GameState.iss.LOADED;
 					node.emit('WINDOW_LOADED');
// 					if (node.game.gameState.is === node.GameState.iss.LOADING_WINDOW) {
// 						console.log(node.game.gameState.is + ' = ' + node.GameState.iss.LOADING_WINDOW);
// 						node.game.gameState.is === node.GameState.iss.LOADING;
// 						console.log('back to loading');
// 					}
//		    		else {
//		    			console.log('gamewindow last');
//		    			node.emit('LOADED');
//		    		}
 				}
 			}
 			else {
				console.log('not yet ' + window.frames[frame].document.readyState);
 			}
 		}, 100);
 	};
	
 	
 	
// NEW VERSION 	
 	
//	// FAKE ONLOAD  TODO: try to make it work with onload
//	GameWindow.prototype.loadFrame = function (url, func, frame) {
//		var that = this;	
//		var frame = frame || this.frame;
//		frame.location = url;
//		
//		var ii=0;
//		var isFrameLoaded = setInterval( function() {
//			if (frame.document.readyState === 'complete') {
//				clearInterval(isFrameLoaded);
//				console.log('Completing...' + url);
//				if (func) {
//		    		func.call(); // TODO: Pass the right this reference
//		    		console.log('Frame Loaded correctly!');
//		    	}
//			}
//			else {
//				console.log('not yet ' + frame.document.readyState);
//			}
//		}, 100);
//	};
	
	GameWindow.prototype.loadPage = function (url, frame) {
		var frame = this.mainframe || frame;
		var that = this;
		
		// TODO: check which one are really necessary
		window.frames[frame].src = url;
		window.frames[frame].location = url;
		window.frames[frame].location = url;
		window.frames[frame].location.href = url;
		
		window.frames[frame].document.onreadystatechange = function() {
		    if (this.readyState==='complete'){
		    	that.frame = window.frames[frame].document;
		    }
		    else {
		    	console.log('not yet ' + window.frames[frame].document.readyState);
		    }
		};
	};
	
	GameWindow.prototype.getFrame = function() {
		return this.frame = window.frames['mainframe'].document;
	};
	
	
	// Header
	
	GameWindow.prototype.addHeader = function (root, id) {
		return this.addDiv(root,id);
	};
	
	// Gadget
	
	GameWindow.prototype.addWidget = function (g, root, options) {
		var root = root || this.root;
		// Check if it is a object (new gadget)
		// If it is a string is the name of an existing gadget
		if ('object' !== typeof g) {
			g = new this.widgets[g](options);
		}
		
		console.log('nodeWindow: registering gadget ' + g.name + ' v.' +  g.version);
		try {
			g.append(root);
			g.listeners();
		}
		catch(e){
			throw 'Not compatible gadget: ' + e;
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