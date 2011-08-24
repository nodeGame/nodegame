// TODO: hide helping classes

/*!
 * ChernoffFaces
 * 
 * Parametrically display Chernoff Faces
 * 
 */

function ChernoffFaces(id) {
	
	this.game = nodeGame.game;
	this.id = id || 'ChernoffFaces';
	this.name = 'Chernoff Faces';
	this.version = '0.1';
	
	this.bar = null;
	this.root = null;
	
	this.recipient = null;
};

ChernoffFaces.prototype.append = function (root, ids) {
	
	var PREF = this.id + '_';
	
	var idFieldset = PREF + 'fieldset'; 
	var idCanvas = PREF + 'canvas';

	
	if (ids !== null && ids !== undefined) {
		if (ids.hasOwnProperty('fieldset')) idFieldset = ids.fieldset;
		if (ids.hasOwnProperty('canvas')) idCanvas = ids.canvs;
	}
	
	var fieldset = nodeWindow.addFieldset(root, idFieldset, 'Chernoff Box');
	
	var canvas = nodeWindow.addCanvas(fieldset, idCanvas);
	
	var fp = new FacePainter(canvas);
	var fv = new FaceVector();
	
	fp.draw(fv);
	
	var that = this;

//	sendButton.onclick = function() {
//		
//		var to = that.recipient.value;
//
//		//try {
//			//var data = JSON.parse(dataInput.value);
//			data = dataInput.value;
//			console.log('Parsed Data: ' + JSON.stringify(data));
//			
//			node.fire(node.OUT + node.actions.SAY + '.DATA',data,to);
////			}
////			catch(e) {
////				console.log('Impossible to parse the data structure');
////			}
//	};
	
	return fieldset;
	
};

ChernoffFaces.prototype.listeners = function () {
//	var that = this;
//	var PREFIX = 'in.';
//	
//	node.onPLIST( function(msg) {
//			nodeWindow.populateRecipientSelector(that.recipient,msg.data);
//		}); 
};


/*!
* ChernoffFaces
* 
* Parametrically display Chernoff Faces
* 
*/

function FacePainter (canvas, settings) {
	
	this.canvas = canvas;
	
	// Used for scaling and translating face.
	this.x_factor = null, 
	this.y_factor = null;
		
	this.canvas = nodeWindow.create.Canvas(canvas);
		
};

//Draws a Chernoff face.
//
//This code draws the face into a logical space with dimensions 100x100, and
//scales it to the actual size specified by width and height.
FacePainter.prototype.draw = function (face, x, y) {
	
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
FacePainter.prototype.fit2Canvas = function() {
	if (!this.canvas) {
		console.log('No canvas found');
		return;
	}
	
	// TODO
	//this.canvas.
}

FacePainter.prototype.drawHead = function (face, x, y) {
	
	var radius = face.head_radius;
	var eccentricity = 1 || face.head_eccentricity;
	
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

	var height = y - FacePainter.computeFaceOffset(face, face.eye_height);
	var spacing = face.eye_spacing;
		
	var radius = face.eye_radius;


	this.canvas.drawOval({
					x: x - spacing,
					y: height,
					radius: radius,
					scale_x: face.eye_scale_x,
					scale_y: face.eye_scale_y,
					color: face.color,
					lineWidth: face.lineWidth
					
	});
	
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

//TODO Scaling ?
FacePainter.computeFaceOffset = function (face, offset) {
	return face.head_radius/2 * offset;
};

FacePainter.prototype.drawPupils = function (face, x, y) {
		
	var radius = face.pupil_radius;
	var spacing = face.eye_spacing;
	var height = y - FacePainter.computeFaceOffset(face, face.eye_height);
	
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


FacePainter.computeEyebrowOffset = function (face) {
	return FacePainter.computeFaceOffset(face, face.eye_height) + ((face.eye_radius / 2) * face.eye_scale_y) + face.eyebrow_height;
};

FacePainter.prototype.drawEyebrow = function (face, x, y) {
	
	var height = y - FacePainter.computeEyebrowOffset(face);
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
	
	var height = y - FacePainter.computeFaceOffset(face, face.nose_height);
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
	
	var height = y + FacePainter.computeFaceOffset(face, face.mouth_height);
	var startX = x - face.mouth_width / 2;
    var endX = x + face.mouth_width / 2;
	
	var top_y = height - face.mouth_top_y;
	var bottom_y = height + face.mouth_top_y;
	
	// Upper Lip
	this.canvas.ctx.moveTo(startX,height);
    this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
    this.canvas.ctx.stroke();
	
    //Lower Lip
    this.canvas.ctx.moveTo(startX,height);
    this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
    this.canvas.ctx.stroke();
   
};	


FacePainter.prototype.controls = function() {
};


/*!
* 
* A description of a Chernoff Face.
*
* This class packages the 11-dimensional vector of numbers from 0 through 1 that completely
* describe a Chernoff face.  
*
*/
function FaceVector (faceVector) {
	
	//if (typeof(faceVector) !== 'undefined') {
	
	var faceVector = faceVector || {};
	
	this.color = faceVector.color || 'green';
	this.lineWidth = faceVector.lineWidth || 1;
	
	this.head_radius = faceVector.head_radius || 30;
	this.head_scale_x = faceVector.head_scale_x || 1;
	this.head_scale_y = faceVector.head_scale_y || 1;
	
	this.eye_height = faceVector.eye_height || 0.75; 
	this.eye_radius = faceVector.eye_radius || 5;
	this.eye_left_x = faceVector.eye_left_x || 40;
	this.eye_right_x = faceVector.eye_right_x || 60;
	this.eye_spacing = faceVector.eye_spacing || 10;
	this.eye_scale_x = faceVector.eye_scale_x || 1;
	this.eye_scale_y = faceVector.eye_scale_y || 1;
	
	this.pupil_radius = faceVector.pupil_radius || 0.2 * this.eye_radius;
	this.pupil_scale_x = faceVector.pupil_scale_x || 1;
	this.pupil_scale_y = faceVector.pupil_scale_y || 1;
	
	this.eyebrow_length = faceVector.eyebrow_length || 10;
	this.eyebrow_height = faceVector.eyebrow_height || 6;
	this.eyebrow_angle = faceVector.eyebrow_angle || -0.5; // Math.PI , 1
	this.eyebrow_spacing = faceVector.eyebrow_spacing || 5;
	
	this.nose_height = faceVector.nose_height || 0.8;
	this.nose_length = faceVector.nose_length || 15;
	this.nose_width = faceVector.nose_width || 10;
	
	this.mouth_height = faceVector.mouth_height || 1;
	this.mouth_width = faceVector.mouth_width || 20;
	this.mouth_top_y = faceVector.mouth_top_y || 10;
	this.mouth_bottom_y = faceVector.mouth_bottom_y || 10;
	
	
	// TODO: random init;
		
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