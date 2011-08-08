/*!
 * nodeWindow v0.2
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on So 7. Aug 20:35:53 CEST 2011
 *
 */
 
 
(function( nodeGame ) {

	console.log('nodeWindow: loading...');
	
	if (nodeGame) {
		var gsc = nodeGame.gsc || null;
		var game = nodeGame.game || null;
	}
	else {
		console.log('nodeWindow: nodeGame not found');
	}
	
// Starting Classes

/*!
 * Document
 * 
 */

function Document() {};

Document.prototype.addButton = function (root, id, text, attributes) {
	var sb = document.createElement('button');
	sb.id = id;
	sb.appendChild(document.createTextNode(text || 'Send'));	
	this.addAttributes2Elem(sb, attributes);

	root.appendChild(sb);
	return sb;
};

Document.prototype.addFieldset = function (root, id, legend, attributes) {
	var f = this.addElement('fieldset', root, id, attributes);
	var l = document.createElement('Legend');
	l.appendChild(document.createTextNode(legend));	
	f.appendChild(l);
	root.appendChild(f);
	return f;
};

Document.prototype.addTextInput = function (root, id, attributes) {
	var mt =  document.createElement('input');
	mt.id = id;
	mt.setAttribute('type', 'text');
	this.addAttributes2Elem(mt, attributes);
	root.appendChild(mt);
	return mt;
};

Document.prototype.addSelect = function (root, id, attributes) {
	return this.addElement('select', root, id, attributes);
};

Document.prototype.populateSelect = function (select,list) {
	
	for (var key in list) {
		if (list.hasOwnProperty(key)) {
			var opt = document.createElement('option');
			opt.value = list[key];
			opt.appendChild(document.createTextNode(key));
			select.appendChild(opt);
		}
	}
};

Document.prototype.write = function (root, text) {
	var tn = document.createTextNode(text);
	root.appendChild(tn);
	return tn;
};

Document.prototype.writeln = function (root, text, rc) {
	var RC = rc || '<br />';
	return this.write(root, text+RC);
};

// IFRAME

Document.prototype.addIFrame = function (root, id, attributes) {
	var attributes = {'name' : id}; // For Firefox
	return this.addElement('iframe', root, id, attributes);
};


// BR

Document.prototype.addBr = function (root, id, attributes) {
	return this.addElement('br', root, id, attributes);
};

// CSS

Document.prototype.addCSS = function (root, css, id, attributes) {
	
	var attributes = attributes || {'rel' : 'stylesheet',
									'type': 'text/css'};
	
	attributes.href = css;
	
	var id = id || 'maincss';
	
	return this.addElement('link', root, id, attributes);
};


Document.prototype.addDiv = function (root, id, attributes) {
	return this.addElement('div', root, id, attributes);
};


// TODO: Potentially unsafe
// Works only with Chrome
Document.prototype.loadFile = function (container,file) {
	
	// Check for the various File API support.
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
	  console.log('The File APIs are not fully supported in this browser.');
	  return false;
	}
	function onInitFs(fs) {
	  console.log('Opened file system: ' + fs.name);
	}
	
	function errorHandler(e) {
		  var msg = '';

		  switch (e.code) {
		    case FileError.QUOTA_EXCEEDED_ERR:
		      msg = 'QUOTA_EXCEEDED_ERR';
		      break;
		    case FileError.NOT_FOUND_ERR:
		      msg = 'NOT_FOUND_ERR';
		      break;
		    case FileError.SECURITY_ERR:
		      msg = 'SECURITY_ERR';
		      break;
		    case FileError.INVALID_MODIFICATION_ERR:
		      msg = 'INVALID_MODIFICATION_ERR';
		      break;
		    case FileError.INVALID_STATE_ERR:
		      msg = 'INVALID_STATE_ERR';
		      break;
		    default:
		      msg = 'Unknown Error';
		      break;
		  }

		  console.log('Error: ' + msg);
	};
	
	// second param is 5MB, reserved space for storage
	window.requestFileSystem(window.PERSISTENT, 5*1024*1024, onInitFs, errorHandler);
	
		
	container.innerHTML += 'DONE FS';
	return container;
};

// Util

Document.prototype.addElement = function (elem, root, id, attributes) {
	var e = document.createElement(elem);
	e.id = id;
	this.addAttributes2Elem(e, attributes);
	
	root.appendChild(e);
	return e;
};

Document.prototype.addAttributes2Elem = function (e, a) {
	
	for (var key in a) {
		if (a.hasOwnProperty(key)){
			e.setAttribute(key,a[key]);
		}
	}
	return e;
};

Document.prototype.removeChildrenFromNode = function (e) {
	
    if(!e) {
        return false;
    }
    if(typeof(e)=='string') {
        e = xGetElementById(e);
    }
    while (e.hasChildNodes()) {
        e.removeChild(e.firstChild);
    }
    return true;
};
 
 
/*!
 * GameWindow
 */

GameWindow.prototype = new Document();
GameWindow.prototype.constructor = GameWindow;

function GameWindow() {
	
	Document.call(this);
	this.mainframe = 'mainframe';
	this.root = this.generateRandomRoot();
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
		
		nodeGame.removeListener('in.STATE');
	
		// TODO: use multiple ifs instead
		try {
			
			var nps = new NextPreviousState();
			this.addGadget(this.root,nps);
			
			var gs = new GameSummary();
			this.addGadget(this.root,gs);
			
			var sd = new StateDisplay();
			this.addGadget(this.root,sd);
			
			var sb = new StateBar();
			this.addGadget(this.root,sb);

			var db = new DataBar();
			this.addGadget(this.root,db);
			
			var mb = new MsgBar();
			nodeWindow.addGadget(this.root,mb);
			
			var gm = new GameBoard();
			this.addGadget(this.root,gm);
					
			var w = new Wall();
			this.addGadget(this.root,w);
		}
		catch(e) {
			console.log('nodeWindow: Standard Gadget not found ' + e.message);
		}
		
		break;
		
		
	case 'PLAYER':
		
		var maincss		= this.addCSS(this.root, 'style.css');
	    var mainframe 	= this.addIFrame(this.root,'mainframe');
	    
	    var ws = new WaitScreen();
		nodeWindow.addGadget(this.root,ws);
	    
		break;
	}
};

//1. Load a Frame into the mainframe or other specified frame
//2. Wait until the frame is loaded
//3. Put a reference of the loaded frame.document into this.frame
//4. Exec the callback function
//GameWindow.prototype.loadFrame = function (url, func, frame) {
//		var frame = this.mainframe || frame;
//		var that = this;
//	
//		// TODO: check which one are really necessary
//		//window.frames[frame].src = url;
//		window.frames[frame].location = url;
//		//window.frames[frame].location.href = url;
//		console.log('Loaded Frame');
//		window.frames[frame].document.onload = function() {
//			console.log('THIS' + this);
//		    if (this.readyState==='complete'){
//		    	that.frame = window.frames[frame].document;
//		    	if (func) {
//		    		func.call(); // TODO: Pass the right this reference
//		    		console.log('Frame Loaded correctly!');
//		    	}
//		    }
//		    else {
//		    	console.log('DEBUG: frame not ready ' + window.frames[frame].document.readyState);
//		    }
//		};
//};


// FAKE ONLOAD  TODO: try to make it work with onload
GameWindow.prototype.loadFrame = function (url, func, frame) {
	var frame = this.mainframe || frame;
	var that = this;	
	window.frames[frame].location = url;
	//window.frames[frame].location.href = url;
	
	this.frame = window.frames[frame].document;
	var ii=0;
	var isFrameLoaded = setInterval( function() {
		if (window.frames[frame].document.readyState === 'complete') {
		//if (window.frames[frame].document) {	
			clearInterval(isFrameLoaded);
			//console.log('Interval cleared');
			that.frame = window.frames[frame].document;
			if (func) {
	    		func.call(); // TODO: Pass the right this reference
	    		//console.log('Frame Loaded correctly!');
	    	}
		}
		else {
			console.log('not yet ' + window.frames[frame].document.readyState);
		}
	}, 100);
};

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

GameWindow.prototype.addGadget = function (root, g) {
	
	console.log('nodeWindow: registering gadget ' + g.name + ' v.' +  g.version);
	try {
		g.append(root);
		g.listeners();
	}
	catch(e){
		throw 'Not compatible gadget: ' + e.message;
	}
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
	var pl = node.create.PlayerList(playerList);
	
	
	try {
		pl.forEach( function(p) {
			opt = document.createElement('option');
			opt.value = p.connid;
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
 

	//Expose nodeGame to the global object
	window.nodeGameWindow = window.nodeWindow = new GameWindow();
	

})(window.nodeGame);