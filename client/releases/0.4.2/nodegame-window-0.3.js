/*!
 * nodeWindow v0.3
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on Mon Oct 24 18:24:50 CEST 2011
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
 * Canvas
 * 
 */ 

function Canvas(canvas) {
	this.canvas = canvas;
	// 2D Canvas Context 
	this.ctx = canvas.getContext('2d');
	
	this.centerX = canvas.width / 2;
	this.centerY = canvas.height / 2;
	
	this.width = canvas.width;
	this.height = canvas.height;
	
	console.log(canvas.width);
	console.log(canvas.height);		
};

Canvas.prototype = {
			
	constructor: Canvas,
	
	drawOval: function (settings) {
	
		// We keep the center fixed
		var x = settings.x / settings.scale_x;
		var y = settings.y / settings.scale_y;
	
		var radius = settings.radius || 100;
		//console.log(settings);
		//console.log('X,Y(' + x + ', ' + y + '); Radius: ' + radius + ', Scale: ' + settings.scale_x + ',' + settings.scale_y);
		
		this.ctx.lineWidth = settings.lineWidth || 1;
		this.ctx.strokeStyle = settings.color || '#000000';
		
		this.ctx.save();
		this.ctx.scale(settings.scale_x, settings.scale_y);
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, Math.PI*2, false);
		this.ctx.stroke();
		this.ctx.closePath();
		this.ctx.restore();
	},
	
	drawLine: function (settings) {
	
		var from_x = settings.x;
		var from_y = settings.y;
	
		var length = settings.length;
		var angle = settings.angle;
			
		// Rotation
		var to_x = - Math.cos(angle) * length + settings.x;
		var to_y =  Math.sin(angle) * length + settings.y;
		//console.log('aa ' + to_x + ' ' + to_y);
		
		//console.log('From (' + from_x + ', ' + from_y + ') To (' + to_x + ', ' + to_y + ')');
		//console.log('Length: ' + length + ', Angle: ' + angle );
		
		this.ctx.lineWidth = settings.lineWidth || 1;
		this.ctx.strokeStyle = settings.color || '#000000';
		
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.moveTo(from_x,from_y);
		this.ctx.lineTo(to_x,to_y);
		this.ctx.stroke();
		this.ctx.closePath();
		this.ctx.restore();
	},
	
	scale: function (x,y) {
		this.ctx.scale(x,y);
		this.centerX = this.canvas.width / 2 / x;
		this.centerY = this.canvas.height / 2 / y;
	},
	
	clear: function() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		// For IE
		var w = this.canvas.width;
		this.canvas.width = 1;
		this.canvas.width = w;
	}
	
}; 
 
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

Document.prototype.addCanvas = function (root, id, attributes) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
		
	if (!context) {
		alert('Canvas is not supported');
		return false;
	}
	
	canvas.id = id;
	this.addAttributes2Elem(canvas, attributes);
	root.appendChild(canvas);
	return canvas;
};

Document.prototype.addSlider = function (root, id, attributes) {
	var slider = document.createElement('input');
	slider.id = id;
	slider.setAttribute('type', 'range');
	this.addAttributes2Elem(slider, attributes);
	root.appendChild(slider);
	return slider;
};

Document.prototype.addJQuerySlider = function (root, id, attributes) {
	var slider = document.createElement('div');
	slider.id = id;
	slider.slider(attributes);
	root.appendChild(slider);
	return slider;
};


Document.prototype.addLabel = function (root, id, labelText, forElem, attributes) {
	var label = document.createElement('label');
	label.id = id;
	label.appendChild(document.createTextNode(labelText));	
	label.setAttribute('for', forElem);
	this.addAttributes2Elem(label, attributes);
	
	var root = document.getElementById(forElem);
	root.parentNode.insertBefore(label,root);
	return label;
	
	// Add the label immediately before if no root elem has been provided
	if (!root) {
		var root = document.getElementById(forElem);
		root.insertBefore(label);
	}
	else {
		root.appendChild(label);
	}
	return label;
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

Document.prototype.addBr = function (root) {
	var br = document.createElement('br');
	return this.insertAfter(br,root);
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
	if (id) {
		e.id = id;
	}
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

Document.prototype.insertAfter = function (node, referenceNode) {
	  referenceNode.insertBefore(node, referenceNode.nextSibling);
};

 
 
/*!
 * GameWindow
 */

var Player = node.Player;
var PlayerList = node.PlayerList;

GameWindow.prototype = new Document();
GameWindow.prototype.constructor = GameWindow;

GameWindow.prototype.create = {};

GameWindow.prototype.create.Canvas = function(canvas){
	return new Canvas(canvas);
};

GameWindow.prototype.create.List = function(id){
	return new List(id);
};

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
		
		// TODO: Check this
		node.node.removeListener('in.STATE');
	
		// TODO: use multiple ifs instead
		//try {
			
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
			this.addGadget(this.root,mb);
			
			var gm = new GameBoard();
			this.addGadget(this.root,gm);
					
			var w = new Wall();
			this.addGadget(this.root,w);
//		}
//		catch(e) {
//			console.log('nodeWindow: Error loading gadget ' + e);
//		}
		
		break;
		
		
	case 'PLAYER':
		
		var maincss		= this.addCSS(this.root, 'style.css');
	    var mainframe 	= this.addIFrame(this.root,'mainframe');
	    
	    var ws = new WaitScreen();
		this.addGadget(this.root,ws);
	    
		break;
	}
	
	this.frame = window.frames[this.mainframe];
};


GameWindow.prototype.getElementById = function (id) {
	return this.frame.getElementById(id);
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


// TODO: frames are loaded taking into account also the path of the game in the server

// FAKE ONLOAD  TODO: try to make it work with onload
GameWindow.prototype.loadFrame = function (url, func, frame) {
	var frame =  frame || this.mainframe;
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
		throw 'Not compatible gadget: ' + e;
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


// 
 
/*!
 * 
 * List: handle list operation
 * 
 */

function List(id) {
	this.id = id || 'list';
	
	this.FIRST_LEVEL = 'dl';
	this.SECOND_LEVEL = 'dt';
	this.THIRD_LEVEL = 'dd';

	this.list = [];
}

List.prototype.append = function(root) {
	return root.appendChild(this.write());
};

List.prototype.add = function(elem) {
	this.list.push(elem);
};

List.prototype.write = function() {
	
	var root = document.createElement(this.FIRST_LEVEL);
	
	var i = 0;
	var len = list.length;
	for (;i<len;i++) {
		var elem = document.createElement(this.SECOND_LEVEL);
		elem.appendChild(list[i]);
		root.appendChild(elem);
	}
	
	return root;
};

List.prototype.getRoot = function() {
	return document.createElement(this.FIRST_LEVEL);
};

List.prototype.getItem = function() {
	return document.createElement(this.SECOND_LEVEL);
};
 
 

	//Expose nodeGame to the global object
	nodeGame.window = new GameWindow();
	

})(window.node);