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
		
	this.canvas = new Canvas(canvas);
		
};

// Draws a Chernoff face.
//
// This code draws the face into a logical space with dimensions 100x100, and
// scales it to the actual size specified by width and height.
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

//FacePainter.prototype.scale_x = function (x) {
//	return x * x_factor;
//};
//
//FacePainter.prototype.scale_y = function (y) {
//	return y * y_factor;
//};

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

// TODO Scaling ?
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
	
	//var lineWidth = settings.lineWidth = settings.lineWidth || 1;
	//var color = settings.color || '#000000';
	
	// log
	
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
	
    //Lowe Lip
    this.canvas.ctx.moveTo(startX,height);
    this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
    this.canvas.ctx.stroke();
    
};	

// Canvas

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
		
		console.log('X,Y(' + x + ', ' + y + '); Radius: ' + radius + ', Scale: ' + settings.scale_x + ',' + settings.scale_y);
		
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
		
		console.log('From (' + from_x + ', ' + from_y + ') To (' + to_x + ', ' + to_y + ')');
		console.log('Length: ' + length + ', Angle: ' + angle );
		
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
	
	clear: function() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		// For IE
		var w = this.canvas.width;
		this.canvas.width = 1;
		canvas.width = w;
	}
	
};

FacePainter.prototype.control = function() {
	
	
}


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

// Constructs a random face vector.
FaceVector.prototype.shuffle = function () {
	for (var key in this) {
		if (this.hasOwnProperty(key)) {
			
			if (key !== 'color') {
				this[key] = Math.random();
			}
		}
	}
};

// Computes the Euclidean distance between two FaceVectors.
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