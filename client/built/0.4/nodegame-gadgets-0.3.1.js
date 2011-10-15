/*!
 * nodeGadgets v0.3.1
 * http://nodegame.org
 *
 * Copyright 2011, Stefano Balietti
 *
 * Built on Sa 15. Okt 15:57:52 CEST 2011
 *
 */
 
 
// TODO: hide helping classes

/*!
 * ChernoffFaces
 * 
 * Parametrically display Chernoff Faces
 * 
 */

ChernoffFaces.defaults = {};
ChernoffFaces.defaults.canvas = {};
ChernoffFaces.defaults.canvas.width = 100;
ChernoffFaces.defaults.canvas.heigth = 100;

function ChernoffFaces(id, dims) {
	
	this.game = nodeGame.game;
	this.id = id || 'ChernoffFaces';
	this.name = 'Chernoff Faces';
	this.version = '0.1';
	
	this.bar = null;
	this.root = null;
	
	this.recipient = null;
	
	this.dims = {
				width: (dims) ? dims.width : ChernoffFaces.defaults.canvas.width, 
				height:(dims) ? dims.height : ChernoffFaces.defaults.canvas.heigth
	};
};

ChernoffFaces.prototype.append = function (root, ids) {
	
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idCanvas = PREF + 'canvas';
	var idButton = PREF + 'button';

	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('canvas')) idCanvas = ids.canvas;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
	}
	
	var fieldset = nodeWindow.addFieldset(root, idFieldset, 'Chernoff Box', {style: 'float:left'});
	
	var canvas = nodeWindow.addCanvas(root, idCanvas, this.dims);
	
	var fp = new FacePainter(canvas);
	var fv = new FaceVector();
	
	fp.draw(fv);
	
	var button = nodeWindow.addButton(fieldset,idButton);
									
	// Add Gadget
	var sc = new SliderControls('cf_controls',FaceVector.defaults);
	nodeWindow.addGadget(fieldset,sc);
	
	var that = this;

	button.onclick = function() {		
		var fv = sc.getAllValues();
		console.log(fv);
		var fv = new FaceVector(fv);
		console.log(fv);
		fp.redraw(fv);
	};
	
	return fieldset;
	
};

ChernoffFaces.prototype.listeners = function () {
	var that = this;
//	
//	node.on( 'input', function(msg) {
//			var fv = new FaceVector(sc.getAllValues());
//			fp.redraw(fv);
//		}); 
};


/*!
* ChernoffFaces
* 
* Parametrically display Chernoff Faces
* 
*/

function FacePainter (canvas, settings) {
		
	this.canvas = nodeWindow.create.Canvas(canvas);
	
	this.scaleX = canvas.width / ChernoffFaces.defaults.canvas.width;
	this.scaleY = canvas.height / ChernoffFaces.defaults.canvas.heigth;
};

//Draws a Chernoff face.
FacePainter.prototype.draw = function (face, x, y) {
			
	this.fit2Canvas(face);
	this.canvas.scale(face.scaleX, face.scaleY);
	
	console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );
	
	var x = x || this.canvas.centerX;
	var y = y || this.canvas.centerY;
	
	this.drawHead(face, x, y);
		
	this.drawEyes(face, x, y);

	this.drawPupils(face, x, y);

	this.drawEyebrow(face, x, y);

	this.drawNose(face, x, y);
	
	this.drawMouth(face, x, y);
	
};		
	
FacePainter.prototype.redraw = function (face, x, y) {
	this.canvas.clear();
	this.draw(face,x,y);
}

FacePainter.prototype.scale = function (x, y) {
	this.canvas.scale(this.scaleX, this.scaleY);
}

// TODO: Improve. It eats a bit of the margins
FacePainter.prototype.fit2Canvas = function(face) {
	if (!this.canvas) {
		console.log('No canvas found');
		return;
	}
	
	if (this.canvas.width > this.canvas.height) {
		var ratio = this.canvas.width / face.head_radius * face.head_scale_x;
	}
	else {
		var ratio = this.canvas.height / face.head_radius * face.head_scale_y;
	}
	
	face.scaleX = ratio / 2;
	face.scaleY = ratio / 2;
}

FacePainter.prototype.drawHead = function (face, x, y) {
	
	var radius = face.head_radius;
	
	this.canvas.drawOval({
				   x: x, 
				   y: y,
				   radius: radius,
				   scale_x: face.head_scale_x,
				   scale_y: face.head_scale_y,
				   color: face.color,
				   lineWidth: face.lineWidth
	});
};

FacePainter.prototype.drawEyes = function (face, x, y) {
	
	var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
	var spacing = face.eye_spacing;
		
	var radius = face.eye_radius;
	//console.log(face);
	this.canvas.drawOval({
					x: x - spacing,
					y: height,
					radius: radius,
					scale_x: face.eye_scale_x,
					scale_y: face.eye_scale_y,
					color: face.color,
					lineWidth: face.lineWidth
					
	});
	//console.log(face);
	this.canvas.drawOval({
					x: x + spacing,
					y: height,
					radius: radius,
					scale_x: face.eye_scale_x,
					scale_y: face.eye_scale_y,
					color: face.color,
					lineWidth: face.lineWidth
	});
}

FacePainter.prototype.drawPupils = function (face, x, y) {
		
	var radius = face.pupil_radius;
	var spacing = face.eye_spacing;
	var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
	
	this.canvas.drawOval({
					x: x - spacing,
					y: height,
					radius: radius,
					scale_x: face.pupil_scale_x,
					scale_y: face.pupil_scale_y,
					color: face.color,
					lineWidth: face.lineWidth
	});
	
	this.canvas.drawOval({
					x: x + spacing,
					y: height,
					radius: radius,
					scale_x: face.pupil_scale_x,
					scale_y: face.pupil_scale_y,
					color: face.color,
					lineWidth: face.lineWidth
	});

};

FacePainter.prototype.drawEyebrow = function (face, x, y) {
	
	var height = FacePainter.computeEyebrowOffset(face,y);
	var spacing = face.eyebrow_spacing;
	var length = face.eyebrow_length;
	var angle = face.eyebrow_angle;
	
	this.canvas.drawLine({
					x: x - spacing,
					y: height,
					length: length,
					angle: angle,
					color: face.color,
					lineWidth: face.lineWidth
				
					
	});
	
	this.canvas.drawLine({
					x: x + spacing,
					y: height,
					length: 0-length,
					angle: -angle,	
					color: face.color,
					lineWidth: face.lineWidth
	});
	
};

FacePainter.prototype.drawNose = function (face, x, y) {
	
	var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
	var nastril_r_x = x + face.nose_width / 2;
	var nastril_r_y = height + face.nose_length;
	var nastril_l_x = nastril_r_x - face.nose_width;
	var nastril_l_y = nastril_r_y; 
	
	this.canvas.ctx.lineWidth = face.lineWidth;
	this.canvas.ctx.strokeStyle = face.color;
	
	this.canvas.ctx.save();
	this.canvas.ctx.beginPath();
	this.canvas.ctx.moveTo(x,height);
	this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
	this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
	//this.canvas.ctx.closePath();
	this.canvas.ctx.stroke();
	this.canvas.ctx.restore();

};
		
FacePainter.prototype.drawMouth = function (face, x, y) {
	
	var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
	var startX = x - face.mouth_width / 2;
    var endX = x + face.mouth_width / 2;
	
	var top_y = height - face.mouth_top_y;
	var bottom_y = height + face.mouth_bottom_y;
	
	// Upper Lip
	this.canvas.ctx.moveTo(startX,height);
    this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
    this.canvas.ctx.stroke();
	
    //Lower Lip
    this.canvas.ctx.moveTo(startX,height);
    this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
    this.canvas.ctx.stroke();
   
};	


//TODO Scaling ?
FacePainter.computeFaceOffset = function (face, offset, y) {
	var y = y || 0;
	//var pos = y - face.head_radius * face.scaleY + face.head_radius * face.scaleY * 2 * offset;
	var pos = y - face.head_radius + face.head_radius * 2 * offset;
	//console.log('POS: ' + pos);
	return pos;
};

FacePainter.computeEyebrowOffset = function (face, y) {
	var y = y || 0;
	var eyemindistance = 2;
	return FacePainter.computeFaceOffset(face, face.eye_height, y) - eyemindistance - face.eyebrow_eyedistance;
};


/*!
* 
* A description of a Chernoff Face.
*
* This class packages the 11-dimensional vector of numbers from 0 through 1 that completely
* describe a Chernoff face.  
*
*/

//FaceVector.defaults = {
//		// Head
//		head_radius: {
//			// id can be specified otherwise is taken head_radius
//			min: 10,
//			max: 100,
//			step: 0.01,
//			value: 30,
//			label: 'Face radius'
//		},
//		head_scale_x: {
//			min: 0.2,
//			max: 2,
//			step: 0.1,
//			value: 0.5,
//			label: 'Scale head horizontally'
//		},
//		head_scale_y: {
//			min: 0.2,
//			max: 2,
//			step: 0.1,
//			value: 1,
//			label: 'Scale head vertically'
//		},
//		// Eye
//		eye_height: {
//			min: 0.1,
//			max: 0.9,
//			step: 0.1,
//			value: 0.4,
//			label: 'Eye height'
//		},
//		eye_radius: {
//			min: 2,
//			max: 30,
//			step: 1,
//			value: 5,
//			label: 'Eye radius'
//		},
//		eye_spacing: {
//			min: 0,
//			max: 50,
//			step: 2,
//			value: 10,
//			label: 'Eye spacing'
//		},
//		eye_scale_x: {
//			min: 0.2,
//			max: 2,
//			step: 0.2,
//			value: 1,
//			label: 'Scale eyes horizontally'
//		},
//		eye_scale_y: {
//			min: 0.2,
//			max: 2,
//			step: 0.2,
//			value: 1,
//			label: 'Scale eyes vertically'
//		},
//		// Pupil
//		pupil_radius: {
//			min: 1,
//			max: 9,
//			step: 1,
//			value: 1,  //this.eye_radius;
//			label: 'Pupil radius'
//		},
//		pupil_scale_x: {
//			min: 0.2,
//			max: 2,
//			step: 0.2,
//			value: 1,
//			label: 'Scale pupils horizontally'
//		},
//		pupil_scale_y: {
//			min: 0.2,
//			max: 2,
//			step: 0.2,
//			value: 1,
//			label: 'Scale pupils vertically'
//		},
//		// Eyebrow
//		eyebrow_length: {
//			min: 1,
//			max: 30,
//			step: 1,
//			value: 10,
//			label: 'Eyebrow length'
//		},
//		eyebrow_eyedistance: {
//			min: 0.3,
//			max: 10,
//			step: 0.2,
//			value: 3, // From the top of the eye
//			label: 'Eyebrow from eye'
//		},
//		eyebrow_angle: {
//			min: -2,
//			max: 2,
//			step: 0.2,
//			value: -0.5,
//			label: 'Eyebrow angle'
//		},
//		eyebrow_spacing: {
//			min: 0,
//			max: 20,
//			step: 1,
//			value: 5,
//			label: 'Eyebrow spacing'
//		},
//		// Nose
//		nose_height: {
//			min: 0.4,
//			max: 1,
//			step: 0.1,
//			value: 0.4,
//			label: 'Nose height'
//		},
//		nose_length: {
//			min: 0.2,
//			max: 30,
//			step: 0.2,
//			value: 15,
//			label: 'Nose length'
//		},
//		nose_width: {
//			min: 0,
//			max: 30,
//			step: 2,
//			value: 10,
//			label: 'Nose width'
//		},
//		// Mouth
//		mouth_height: {
//			min: 0.2,
//			max: 2,
//			step: 0.1,
//			value: 0.75, 
//			label: 'Mouth height'
//		},
//		mouth_width: {
//			min: 2,
//			max: 100,
//			step: 2,
//			value: 20,
//			label: 'Mouth width'
//		},
//		mouth_top_y: {
//			min: -10,
//			max: 30,
//			step: 0.5,
//			value: -2,
//			label: 'Upper lip'
//		},
//		mouth_bottom_y: {
//			min: -10,
//			max: 30,
//			step: 0.5,
//			value: 20,
//			label: 'Lower lip'
//		}					
//};

FaceVector.defaults = {
		// Head
		head_radius: {
			// id can be specified otherwise is taken head_radius
			min: 10,
			max: 100,
			step: 0.01,
			value: 30,
			label: 'Face radius'
		},
		head_scale_x: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 0.5,
			label: 'Scale head horizontally'
		},
		head_scale_y: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale head vertically'
		},
		// Eye
		eye_height: {
			min: 0.1,
			max: 0.9,
			step: 0.01,
			value: 0.4,
			label: 'Eye height'
		},
		eye_radius: {
			min: 2,
			max: 30,
			step: 0.01,
			value: 5,
			label: 'Eye radius'
		},
		eye_spacing: {
			min: 0,
			max: 50,
			step: 0.01,
			value: 10,
			label: 'Eye spacing'
		},
		eye_scale_x: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale eyes horizontally'
		},
		eye_scale_y: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale eyes vertically'
		},
		// Pupil
		pupil_radius: {
			min: 1,
			max: 9,
			step: 0.01,
			value: 1,  //this.eye_radius;
			label: 'Pupil radius'
		},
		pupil_scale_x: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale pupils horizontally'
		},
		pupil_scale_y: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 1,
			label: 'Scale pupils vertically'
		},
		// Eyebrow
		eyebrow_length: {
			min: 1,
			max: 30,
			step: 0.01,
			value: 10,
			label: 'Eyebrow length'
		},
		eyebrow_eyedistance: {
			min: 0.3,
			max: 10,
			step: 0.01,
			value: 3, // From the top of the eye
			label: 'Eyebrow from eye'
		},
		eyebrow_angle: {
			min: -2,
			max: 2,
			step: 0.01,
			value: -0.5,
			label: 'Eyebrow angle'
		},
		eyebrow_spacing: {
			min: 0,
			max: 20,
			step: 0.01,
			value: 5,
			label: 'Eyebrow spacing'
		},
		// Nose
		nose_height: {
			min: 0.4,
			max: 1,
			step: 0.01,
			value: 0.4,
			label: 'Nose height'
		},
		nose_length: {
			min: 0.2,
			max: 30,
			step: 0.01,
			value: 15,
			label: 'Nose length'
		},
		nose_width: {
			min: 0,
			max: 30,
			step: 0.01,
			value: 10,
			label: 'Nose width'
		},
		// Mouth
		mouth_height: {
			min: 0.2,
			max: 2,
			step: 0.01,
			value: 0.75, 
			label: 'Mouth height'
		},
		mouth_width: {
			min: 2,
			max: 100,
			step: 0.01,
			value: 20,
			label: 'Mouth width'
		},
		mouth_top_y: {
			min: -10,
			max: 30,
			step: 0.01,
			value: -2,
			label: 'Upper lip'
		},
		mouth_bottom_y: {
			min: -10,
			max: 30,
			step: 0.01,
			value: 20,
			label: 'Lower lip'
		}					
};

function FaceVector (faceVector) {
	
	//if (typeof(faceVector) !== 'undefined') {
	
	var faceVector = faceVector || {};
	
	this.scaleX = faceVector.scaleX || 1;
	this.scaleY = faceVector.scaleY || 1;
	
	this.color = faceVector.color || 'green';
	this.lineWidth = faceVector.lineWidth || 1;
	
	// Merge on key
	for (var key in FaceVector.defaults) {
		if (FaceVector.defaults.hasOwnProperty(key)){
			if (faceVector.hasOwnProperty(key)){
				this[key] = faceVector[key];
			}
			else {
				this[key] = FaceVector.defaults[key].value;
			}
		}
	}
		
	delete this.faceVector;
	
		
};

//Constructs a random face vector.
FaceVector.prototype.shuffle = function () {
	for (var key in this) {
		if (this.hasOwnProperty(key)) {
			
			if (key !== 'color') {
				this[key] = Math.random();
			}
		}
	}
};

//Computes the Euclidean distance between two FaceVectors.
FaceVector.prototype.distance = function (face) {
	return FaceVector.distance(this,face);
};
	
	
FaceVector.distance = function (face1, face2) {
	var sum = 0.0;
	var diff;
	
	for (var key in face1) {
		if (face1.hasOwnProperty(key)) {
			diff = face1[key] - face2[key];
			sum = sum + diff * diff;
		}
	}
	
	return Math.sqrt(sum);
};

FaceVector.prototype.toString = function() {
	var out = 'Face: ';
	for (var key in this) {
		if (this.hasOwnProperty(key)) {
			out += key + ' ' + this[key];
		}
	};
	return out;
};
 
 
 
 
/*
 * DataBar
 * 
 * Sends DATA msgs
 * 
 */

function DataBar(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'databar';
	this.name = 'Data Bar';
	this.version = '0.2.1';
	
	this.bar = null;
	this.root = null;
	
	this.recipient = null;
};

DataBar.prototype.append = function (root, ids) {
	
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idButton = PREF + 'sendButton';
	var idData = PREF + 'dataText';
	var idRecipient = PREF + 'recipient'; 
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
		if (ids.hasOwnProperty('data')) idData = ids.data;
		if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
	}
	
	var fieldset = nodeWindow.addFieldset(root, idFieldset, 'Send Data to Players');
	var sendButton = nodeWindow.addButton(fieldset, idButton);
	var dataInput = nodeWindow.addTextInput(fieldset, idData);
	
	this.recipient = nodeWindow.addRecipientSelector(fieldset, idRecipient);
	
	
	
	var that = this;

	sendButton.onclick = function() {
		
		var to = that.recipient.value;

		//try {
			//var data = JSON.parse(dataInput.value);
			data = dataInput.value;
			console.log('Parsed Data: ' + JSON.stringify(data));
			
			node.fire(node.OUT + node.actions.SAY + '.DATA',data,to);
//			}
//			catch(e) {
//				console.log('Impossible to parse the data structure');
//			}
	};
	
	return fieldset;
	
};

DataBar.prototype.listeners = function () {
	var that = this;
	var PREFIX = 'in.';
	
	node.onPLIST( function(msg) {
			nodeWindow.populateRecipientSelector(that.recipient,msg.data);
		}); 
}; 
 
 
 
/*!
 * GameBoard
 */ 

function GameBoard (id) {
	
	this.game = nodeGame.game;
	this.id = id || 'gboard';
	this.name = 'GameBoard';
	
	this.version = '0.2.1';
	
	this.board = null;
	this.root = null;
	
	this.noPlayers = 'No players connected...';
	
}

GameBoard.prototype.append = function(root) {
	this.root = root;
	var fieldset = nodeWindow.addFieldset(root, this.id + '_fieldset', 'Game State');
	this.board = nodeWindow.addDiv(fieldset,this.id);
	this.board.innerHTML = this.noPlayers;
	
};

GameBoard.prototype.listeners = function() {
	var that = this;
	
	var say = node.actions.SAY + '.';
	var set = node.actions.SET + '.';
	var get = node.actions.GET + '.'; 
	
	node.onPLIST( function (msg) {
		console.log('I Updating Board ' + msg.text);
		that.board.innerHTML = 'Updating...';
		
		var pl = node.create.PlayerList(msg.data);
		
		//console.log(pl);
		
		if (pl.size() !== 0) {
			that.board.innerHTML = '';
			pl.forEach( function(p) {
				//console.log(p);
				var line = '[' + p.id + "|" + p.name + "]> \t"; 
				
				var pState = p.state.state + '.' + p.state.step + ':' + p.state.round; 
				pState += ' ';
				
				switch (p.state.is) {
				
				case node.states.UNKNOWN:
					pState += '(unknown)';
					break;
				case node.states.PLAYING:
					pState += '(playing)';
					break;
				case node.states.DONE:
					pState += '(done)';
					break;	
				case node.states.PAUSE:
					pState += '(pause)';
					break;		
				default:
					pState += '('+p.state.is+')';
					break;		
				}
				
				if (p.state.paused) {
					pState += ' (P)';
				}
				
				that.board.innerHTML += line + pState +'\n<hr style="color: #CCC;"/>\n';
			});
			//this.board.innerHTML = pl.toString('<hr style="color: #CCC;"/>');
			}
			else {
				that.board.innerHTML = that.noPlayers;
			}
		});
}; 
 
 
 
/*!
 * GameSummary
 * 
 * Show Game Info
 */

function GameSummary(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'gamesummary';
	this.name = 'Game Summary';
	this.version = '0.2.1';
	
	this.fieldset = null;
	this.summaryDiv = null;
}


GameSummary.prototype.append = function (root, ids) {
	var that = this;
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset';
	var idSummary = PREF + 'player';
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('player')) idSummary = ids.player;
	}
	
	this.fieldset = nodeWindow.addFieldset(root, idFieldset, 'Game Summary');
	
	
	this.summaryDiv = nodeWindow.addDiv(this.fieldset,idSummary);
	
	
	that.writeSummary();
		
	return this.fieldset;
	
};

GameSummary.prototype.writeSummary = function(idState,idSummary) {
	var gName = document.createTextNode('Name: ' + this.game.name);
	var gDescr = document.createTextNode('Descr: ' + this.game.description);
	var gMinP = document.createTextNode('Min Pl.: ' + this.game.minPlayers);
	var gMaxP = document.createTextNode('Max Pl.: ' + this.game.maxPlayers);
	
	this.summaryDiv.appendChild(gName);
	this.summaryDiv.appendChild(document.createElement('br'));
	this.summaryDiv.appendChild(gDescr);
	this.summaryDiv.appendChild(document.createElement('br'));
	this.summaryDiv.appendChild(gMinP);
	this.summaryDiv.appendChild(document.createElement('br'));
	this.summaryDiv.appendChild(gMaxP);
	
	nodeWindow.addDiv(this.fieldset,this.summaryDiv,idSummary);
};

GameSummary.prototype.listeners = function() {};  
 
 
 
/*!
 * MsgBar
 * 
 */

function MsgBar(id){
	
	this.game = nodeGame.game;
	this.id = id || 'msgbar';
	this.name = 'Msg Bar';
	this.version = '0.2';
	
	this.recipient = null;
}

MsgBar.prototype.append = function (root, ids) {
	
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idButton = PREF + 'sendButton';
	var idMsgText = PREF + 'msgText';
	var idRecipient = PREF + 'recipient'; 
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
		if (ids.hasOwnProperty('msgText')) idMsgText = ids.msgText;
		if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
	}
	
	var fieldset = nodeWindow.addFieldset(root, idFieldset, 'Send Msg To Players');
	var sendButton = nodeWindow.addButton(fieldset, idButton);
	var msgText = nodeWindow.addTextInput(fieldset, idMsgText);
	this.recipient = nodeWindow.addRecipientSelector(fieldset, idRecipient);
	
	var that = this;
	
	sendButton.onclick = function() {

		// Should be within the range of valid values
		// but we should add a check
		var to = that.recipient.value;
		var msg = that.game.MSG(msgText.value,to);
		//console.log(msg.stringify());
	};

	return fieldset;
	
};

MsgBar.prototype.listeners = function(){
	var that = this;
	
	node.onPLIST( function(msg) {
		nodeWindow.populateRecipientSelector(that.recipient,msg.data);
		// was
		//that.game.window.populateRecipientSelector(that.recipient,msg.data);
	}); 
}; 
 
 
 
/*!
 * NextPreviousState
 * 
 * Step back and forth in the gameState
 * 
 */

function NextPreviousState(id) {
	this.game = nodeGame.game;
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
	
	var fieldset 	= nodeWindow.addFieldset(root, idFieldset, 'Rew-Fwd');
	var rew 		= nodeWindow.addButton(fieldset, idRew, '<<');
	var fwd 		= nodeWindow.addButton(fieldset, idFwd, '>>');
	
	
	var that = this;

	fwd.onclick = function() {
		
		var state = that.game.next();
		
		if (state) {
			var stateEvent = node.OUT + node.actions.SET + '.STATE';
			//var stateEvent = 'out.' + action + '.STATE';
			node.fire(stateEvent,state,'ALL');
		}
		else {
			console.log('No next state. Not sent.');
			node.gsc.sendTXT('E: no next state. Not sent');
		}
	};

	rew.onclick = function() {
		
		var state = that.game.previous();
		
		if (state) {
			var stateEvent = node.OUT + node.actions.SET + '.STATE';
			//var stateEvent = 'out.' + action + '.STATE';
			node.fire(stateEvent,state,'ALL');
		}
		else {
			console.log('No previous state. Not sent.');
			node.gsc.sendTXT('E: no previous state. Not sent');
		}
	};
	
	
	return fieldset;
};

NextPreviousState.prototype.listeners = function () {};  
 
 
 
/*!
 * Slider Controls
 * 
 */

function SliderControls (id, features) {
	this.name = 'Slider Controls'
	this.version = '0.1';
	
	this.id = id;
	this.features = features;
	
	this.list = nodeWindow.create.List();
};

SliderControls.prototype.append = function(root) {
	
	var listRoot = this.list.getRoot();
	root.appendChild(listRoot);
	
	for (var key in this.features) {
		if (this.features.hasOwnProperty(key)) {
			
			var f = this.features[key];
			var id = f.id || key;
			
			var item = this.list.getItem();
			listRoot.appendChild(item);
			
			var attributes = {min: f.min, max: f.max, step: f.step, value: f.value};
			var slider = nodeWindow.addJQuerySlider(item, id, attributes);
			
			// If a label element is present it checks whether it is an
			// object literal or a string.
			// In the former case it scans the obj for additional properties
			if (f.label) {
				var labelId = 'label_' + id;
				var labelText = f.label;
				
				if (typeof(f.label) === 'object') {
					var labelText = f.label.text;
					if (f.label.id) {
						labelId = f.label.id; 
					}
				}
				
				nodeWindow.addLabel(slider, labelId, labelText, id);
			}
			
			
		}
	}
};

SliderControls.prototype.listeners = function() {
	
};

SliderControls.prototype.getAllValues = function() {
	var out = {};
	for (var key in this.features) {
		
		if (this.features.hasOwnProperty(key)) {
			console.log('STE ' + key + ' ' + document.getElementById(key).value);
			out[key] = Number(document.getElementById(key).value);
		}
	}
	
	return out;
}; 
 
 
 
/*
 * StateBar
 * 
 * Sends STATE msgs
 */

function StateBar(id) {
	
	this.game = nodeGame.game;;
	this.id = id || 'statebar';
	this.name = 'State Bar';
	this.version = '0.2.1';
	
	this.actionSel = null;
	this.recipient = null;
}

StateBar.prototype.append = function (root, ids) {
	
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idButton = PREF + 'sendButton';
	var idStateSel = PREF + 'stateSel';
	var idActionSel = PREF + 'actionSel';
	var idRecipient = PREF + 'recipient'; 
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('button')) idButton = ids.button;
		if (ids.hasOwnProperty('state')) idStateSel = ids.idStateSel;
		if (ids.hasOwnProperty('action')) idActionSel = ids.idActionSel;
		if (ids.hasOwnProperty('recipient')) idRecipient = ids.recipient;
	}
	
	var fieldset 	= nodeWindow.addFieldset(root, idFieldset, 'Change Game State');
	var sendButton 	= nodeWindow.addButton(fieldset, idButton);
	var stateSel 	= nodeWindow.addStateSelector(fieldset, idStateSel);
	this.actionSel	= nodeWindow.addActionSelector(fieldset, idActionSel);
	this.recipient 	= nodeWindow.addRecipientSelector(fieldset, idRecipient);
	
	var that = this;

	sendButton.onclick = function() {

		// Should be within the range of valid values
		// but we should add a check
		var to = that.recipient.value;
		
		//var parseState = /(\d+)(?:\.(\d+))?(?::(\d+))?/;
		//var parseState = /^\b\d+\.\b[\d+]?\b:[\d+)]?$/;
		//var parseState = /^(\d+)$/;
		//var parseState = /(\S+)?/;
		var parseState = /^(\d+)(?:\.(\d+))?(?::(\d+))?$/;
		
		var result = parseState.exec(stateSel.value);
		
		if (result !== null) {
			// Note: not result[0]!
			var state = result[1];
			var step = result[2] || 1;
			var round = result[3] || 1;
			console.log('Action: ' + that.actionSel.value + ' Parsed State: ' + result.join("|"));
			
			var state = node.create.GameState(state,step,round);
			
			var stateEvent = node.OUT + that.actionSel.value + '.STATE';
			node.fire(stateEvent,state,to);
		}
		else {
			console.log('Not valid state. Not sent.');
			node.gsc.sendTXT('E: not valid state. Not sent');
		}
	};

	return fieldset;
	
};

StateBar.prototype.listeners = function () {
	var that = this;
	var say = node.actions.SAY + '.';
	var set = node.actions.SET + '.';
	var get = node.actions.GET + '.'; 
	
	node.onPLIST( function(msg) {
		
		nodeWindow.populateRecipientSelector(that.recipient,msg.data);
		// was
		//that.game.window.populateRecipientSelector(that.recipient,msg.data);
	}); 
};  
 
 
 
/*
 * StateDisplay
 * 
 * Sends STATE msgs
 */

function StateDisplay(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'statedisplay';
	this.name = 'State Display';
	this.version = '0.2.1';
	
	this.fieldset = null;
	this.stateDiv = null;
}


StateDisplay.prototype.append = function (root, ids) {
	var that = this;
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset';
	var idPlayer = PREF + 'player';
	var idState = PREF + 'state'; 
	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('player')) idPlayer = ids.player;
		if (ids.hasOwnProperty('state')) idState = ids.state;
	}
	
	this.fieldset = nodeWindow.addFieldset(root, idFieldset, 'Player Status');
	
	
	this.playerDiv = nodeWindow.addDiv(this.fieldset,idPlayer);
	
	var checkPlayerName = setInterval(function(idState,idPlayer){
			if(that.game.player !== null){
				clearInterval(checkPlayerName);
				that.updateAll();
			}
		},100);

	return this.fieldset;
	
};

StateDisplay.prototype.updateAll = function(idState,idPlayer) {
	var pName = document.createTextNode('Name: ' + this.game.player.name);
	var pId = document.createTextNode('Id: ' + this.game.player.id);
	
	this.playerDiv.appendChild(pName);
	this.playerDiv.appendChild(document.createElement('br'));
	this.playerDiv.appendChild(pId);
	
	this.stateDiv = nodeWindow.addDiv(this.playerDiv,idState);
	this.updateState(this.game.gameState);
};

StateDisplay.prototype.updateState =  function(state) {
	var that = this;
	var checkStateDiv = setInterval(function(){
		if(that.stateDiv){
			clearInterval(checkStateDiv);
			that.stateDiv.innerHTML = 'State: ' +  state.toString() + '<br />';
			// was
			//that.stateDiv.innerHTML = 'State: ' +  GameState.stringify(state) + '<br />';
		}
	},100);
};

StateDisplay.prototype.listeners = function () {
	var that = this;
	var say = node.actions.SAY + '.';
	var set = node.actions.SET + '.';
	var get = node.actions.GET + '.'; 
	var IN =  node.IN;
	var OUT = node.OUT;
	
	node.on( 'STATECHANGE', function(state) {
		that.updateState(state);
	}); 
};  
 
 
 
/*
 * Wait Screen
 * 
 * Show a standard waiting screen
 * 
 */

//var waitScreen = function(){

function WaitScreen(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'waiting';
	this.name = 'WaitingScreen';
	this.version = '0.2.1';
	
	
	this.text = 'Waiting for other players...';
	this.waitingDiv = null;
	
}

WaitScreen.prototype.append = function (root, id) {};

WaitScreen.prototype.listeners = function () {
	var that = this;
	node.on('WAIT', function(text) {
		that.waitingDiv = nodeWindow.addDiv(document.body, that.id);
		if (that.waitingDiv.style.display === "none"){
			that.waitingDiv.style.display = "";
		}
	
		that.waitingDiv.appendChild(document.createTextNode(that.text || text));
		that.game.pause();
	});
	
	// It is supposed to fade away when a new state starts
	node.on('STATECHANGE', function(text) {
		if (that.waitingDiv) {
			
			if (that.waitingDiv.style.display == ""){
				that.waitingDiv.style.display = "none";
			}
		// TODO: Document.js add method to remove element
		}
	});
	
};  
 
 
 
/*
 * Wall
 * 
 * Prints lines sequentially;
 * 
 */


function Wall(id) {
	this.game = nodeGame.game;
	this.id = id || 'wall';
	this.name = 'Wall';
	this.version = '0.2.1';
	
	this.wall = null;
	
	this.buffer = [];
	
	this.counter = 0;
	// TODO: buffer is not read now
	
}

Wall.prototype.append = function (root, id) {
	var fieldset = nodeWindow.addFieldset(root, this.id+'_fieldset', 'Game Log');
	var idLogDiv = id || this.id;
	this.wall = nodeWindow.addElement('pre', fieldset, idLogDiv);
};

Wall.prototype.write = function(text) {
	if (document.readyState !== 'complete') {
        this.buffer.push(s);
    } else {
    	var mark = this.counter++ + ') ' + Utils.getTime() + ' ';
    	this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
        this.buffer = []; // Where to place it?
    }  
};

Wall.prototype.listeners = function() {
	var that = this;
//		this.game.on('in.say.MSG', function(p,msg){
//			that.write(msg.toSMS());
//		});
//	
//		this.game.on('out.say.MSG', function(p,msg){
//			that.write(msg.toSMS());
//		});
//	
//	
//		this.game.on('MSG', function(p,msg){
//			that.write(msg.toSMS());
//		});
	
	node.on('LOG', function(msg){
		that.write(msg);
	});
};  
 
 
 
