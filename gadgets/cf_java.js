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
	
	this.x_origin = null;
	this.y_origin = null;
	
	this.setCanvas(canvas);
	
};

FacePainter.prototype.setCanvas = function(canvas) {
	this.canvas = canvas;
	// 2D Canvas Context 
	this.ctx = canvas.getContext('2d');
	
	this.centerX = canvas.width / 2;
	this.centerY = canvas.height / 2;
	
	console.log(canvas.width);
	console.log(canvas.height);
	
	
	this.headRadius = Math.min(canvas.width,canvas.height) * 0.4;
};

// Draws a Chernoff face.
//
// This code draws the face into a logical space with dimensions 100x100, and
// scales it to the actual size specified by width and height.
FacePainter.prototype.draw = function (face, x, y) {
	
	var x = x || this.centerX;
	var y = y || this.centerY;
	
	this.drawHead(face, x, y);
		
	this.drawEyes(face, x, y);

	this.drawPupils(face, x, y);

	this.drawEyebrow(face, x, y);

	this.drawNose(face, x, y);
	
//	this.draw_mouth(g, face.p[6], face.p[9], face.p[10]);
};		
		
FacePainter.prototype.drawHead = function (face, x, y) {
	
	var radius = face.head_radius;
	var eccentricity = 1 || face.head_eccentricity;
	
	this.drawOval({
				   x: x, 
				   y: y,
				   radius: radius,
				   scale_x: face.head_scale_x,
				   scale_y: face.head_scale_y
				   
				   //lineWidth: 4,
				   //color: '#FF0000'
	});
};

FacePainter.prototype.drawEyes = function (face, x, y) {

	var height = y - FacePainter.computeFaceOffset(face, face.eye_height);
	var spacing = face.eye_spacing;
	
	// Not used now
	// If eye_l and eye_r are set spacing will be ignored
//	var eye_l = face.eye_left_x;
//	var eye_r = face.eye_right_x;
	
	var radius = face.eye_radius;


	this.drawOval({
					x: x - spacing,
					y: height,
					radius: radius,
					scale_x: face.eye_scale_x,
					scale_y: face.eye_scale_y
	});
	
	this.drawOval({
					x: x + spacing,
					y: height,
					radius: radius,
					scale_x: face.eye_scale_x,
					scale_y: face.eye_scale_y
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
	
	this.drawOval({
					x: x - spacing,
					y: height,
					radius: radius,
					scale_x: face.pupil_scale_x,
					scale_y: face.pupil_scale_y,
					color: '#black'
	});
	
	this.drawOval({
					x: x + spacing,
					y: height,
					radius: radius,
					scale_x: face.pupil_scale_x,
					scale_y: face.pupil_scale_y,
					color: '#black'
	});

};

FacePainter.prototype.drawOval = function (settings) {
	
	// We keep the center fixed
	var x = settings.x / settings.scale_x;
	var y = settings.y / settings.scale_y;

	var radius = settings.radius || 100;
	
	
	var lineWidth = settings.lineWidth = settings.lineWidth || 1;
	var color = settings.color || '#000000';
	
	console.log('X,Y(' + x + ', ' + y + '); Radius: ' + radius + ', Scale: ' + settings.scale_x + ',' + settings.scale_y);
	
	this.ctx.lineWidth = lineWidth;
	this.ctx.strokeStyle = color;
	
	this.ctx.save();
	this.ctx.scale(settings.scale_x, settings.scale_y);
	this.ctx.beginPath();
	this.ctx.arc(x, y, radius, 0, Math.PI*2, false);
	this.ctx.stroke();
	this.ctx.closePath();
	this.ctx.restore();
}
	
//FacePainter.prototype.drawLine = function (settings) {
//		
//	var from_x = settings.from_x;
//	var from_y = settings.from_y;
//
//	var to_x = settings.to_x;
//	var to_y = settings.to_y;
//	
//	var lineWidth = settings.lineWidth = settings.lineWidth || 1;
//	var color = settings.color || '#000000';
//	
//	console.log('From (' + from_x + ', ' + from_y + ') To (' + to_x + ', ' + to_y + ')');
//	
//	this.ctx.lineWidth = lineWidth;
//	this.ctx.strokeStyle = color;
//	
//	this.ctx.save();
//	this.ctx.beginPath();
//	this.ctx.moveTo(from_x,from_y);
//	this.ctx.lineTo(to_x,to_y);
//	this.ctx.stroke();
//	this.ctx.closePath();
//	this.ctx.restore();
//}

FacePainter.prototype.drawLine = function (settings) {
	
	var from_x = settings.x;
	var from_y = settings.y;

	var length = settings.length;
	var angle = settings.angle;
		
	// Rotation
	var to_x = - Math.cos(angle) * length + settings.x;
	var to_y =  Math.sin(angle) * length + settings.y;
	//console.log('aa ' + to_x + ' ' + to_y);
	
	
	var lineWidth = settings.lineWidth = settings.lineWidth || 1;
	var color = settings.color || '#000000';
	
	console.log('From (' + from_x + ', ' + from_y + ') To (' + to_x + ', ' + to_y + ')');
	console.log('Length: ' + length + ', Angle: ' + angle );
	
	this.ctx.lineWidth = lineWidth;
	this.ctx.strokeStyle = color;
	
	this.ctx.save();
	this.ctx.beginPath();
	this.ctx.moveTo(from_x,from_y);
	this.ctx.lineTo(to_x,to_y);
	this.ctx.stroke();
	this.ctx.closePath();
	this.ctx.restore();
}

FacePainter.computeEyebrowOffset = function (face) {
	return FacePainter.computeFaceOffset(face, face.eye_height) + ((face.eye_radius / 2) * face.eye_scale_y) + face.eyebrow_height;
};

FacePainter.prototype.drawEyebrow = function (face, x, y) {
	
	var height = y - FacePainter.computeEyebrowOffset(face);
	var spacing = face.eyebrow_spacing;
	var length = face.eyebrow_length;
	var angle = face.eyebrow_angle;
	
	this.drawLine({
					x: x - spacing,
					y: height,
					length: length,
					angle: angle
					
					// color: 'red',
					// lineWidth: 5
					
	});
	
	this.drawLine({
					x: x + spacing,
					y: height,
					length: 0-length,
					angle: -angle
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
	
	//this.ctx.lineWidth = lineWidth;
	//this.ctx.strokeStyle = color;
	
	this.ctx.save();
	this.ctx.beginPath();
	this.ctx.moveTo(x,height);
	this.ctx.lineTo(nastril_r_x,nastril_r_y);
	this.ctx.lineTo(nastril_l_x,nastril_l_y);
	//this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.restore();

};
//	
//
//	protected void draw_lip (Graphics g, double x1, double y1, double x2, double y2, double x3, double y3) {
//		int i, new_x, new_y, last_x, last_y;
//
//		// This is some nasty parabolic stuff.  It doesn't look that good because of the stupid
//		// way we scale to non- 100x100 displays.
//		double denom =     (Math.pow(x1, 2) * (x2 - x3))
//					    +  (x1 * (Math.pow(x3, 2) - Math.pow(x2, 2)))
//					    +  (Math.pow(x2, 2) * x3)
//					    + -(Math.pow(x3, 2) * x2);
//					    
//		double a     = (   (y1 * (x2 - x3))
//					    +  (x1 * (y3 - y2))
//					    +  (y2 * x3)
//					    + -(y3 * x2))
//					   / denom;
//					   
//		double bb    = (   (Math.pow(x1, 2) * (y2 - y3))
//						+  (y1 * (Math.pow(x3, 2) - Math.pow(x2, 2)))
//						+  (Math.pow(x2, 2) * y3)
//						+ -(Math.pow(x3, 2) * y2))
//					   / denom;
//					 
//		double c     = (   (Math.pow(x1, 2) * ((x2 * y3) - (x3 * y2)))
//						+  (x1 * ((Math.pow(x3, 2) * y2) - (Math.pow(x2, 2) * y3)))
//						+  (y1 * ((Math.pow(x2, 2) * x3) - (Math.pow(x3, 2) * x2))))
//					   / denom;
//		
//		for(i = (int)x1, last_x = (int)x1, last_y = (int)y1; i <= x2; i++) {
//			new_x = i;
//			new_y = (int)((a * Math.pow(i, 2)) + (bb * i) + c);
//			xLine(g, last_x, last_y, new_x, new_y);
//			last_x = new_x;
//			last_y = new_y;
//		}
//	}
//		
//
//	protected void draw_mouth(Graphics g, double p6, double p9, double p10) {
//		double mouth_size = ((p9 - 0.5) * 10);
//		double x1 = 40 - mouth_size;
//		double y1 = mouth_y;
//		double x2 = 60 + mouth_size;
//		double y2 = mouth_y;
//		double x3 = ((x2 - x1) / 2) + x1;
//		double y3 = ((p6 - 0.5) * 10) + mouth_y;
//
//		draw_lip(g, x1, y1, x2, y2, x3, y3);
//		draw_lip(g, x1, y1, x2, y2, x3, y3 + ((p10 / 2.0) * 10));
//	}
//
//	
//	/** Draws a scaled and translated circle. */
//	protected void xCircle(Graphics g, int x, int y, int radius) {
//		g.drawOval(scale_x(x - radius) + x_origin, scale_y(y - radius) + y_origin,
//		           scale_x(radius * 2), scale_y(radius * 2));
//	}
//	
//	/** Draws a scaled and translated oval. */
//	protected void xOval(Graphics g, int x, int y, int height_r, int width_r) {
//		g.drawOval(scale_x(x - width_r) + x_origin, scale_y(y - height_r) + y_origin,
//				   scale_x(width_r * 2), scale_y(height_r * 2));
//	}
//
//	/** Draw a scaled, translated and filled oval. */
//	protected void xFillOval(Graphics g, int x, int y, int height_r, int width_r) {
//		g.fillOval(scale_x(x - width_r) + x_origin, scale_y(y - height_r) + y_origin,
//				   scale_x(width_r * 2), scale_y(height_r * 2) );
//	}
//	
//	/** Draws a scaled and translated line. */
//	protected void xLine(Graphics g, int x1, int y1, int x2, int y2) {
//		g.drawLine(scale_x(x1) + x_origin, scale_y(y1) + x_origin,
//							 scale_x(x2) + x_origin, scale_y(y2) + x_origin);
//	}
	
// Computes and stores the scaling factors and origin used by xCircle, xOval,
//	    xFillOval & xLine.
FacePainter.prototype.calc_xform_factors = function (x, y, width, height) {
	this.x_factor = width / 100.0;
	this.y_factor = height / 100.0;
	this.x_origin = x;
	this.y_origin = y;
};
	
	
FacePainter.prototype.scale_x = function (x) {
	return x * x_factor;
};

FacePainter.prototype.scale_y = function (y) {
	return y * y_factor;
};
	
	
//	/** Takes a number between 0 and 1 and returns a 2-vector that should be added to the
//	    dimensions of a circle to create an oval. */
//	protected int[] eccentricities(double p) {
//		int[] a = new int[2];
//		
//		if (p > .5) {
//			a[0] = (int)((p - 0.5) * 20.0);
//			a[1] = 0;
//			return a;
//		} else {
//			a[0] = 0;
//			a[1] = (int)(Math.abs(p - 0.5) * 20.0);
//			return a;
//		}
//	}
//}
	

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
	
//	this.eyebrow_r_l_x = faceVector.eyebrow_r_l_x || 55;
//	this.eyebrow_l_r_x = faceVector.eyebrow_l_r_x || 45;
//	this.eyebrow_r_r_x = faceVector.eyebrow_r_r_x || 65;

//	this.nose_apex_x = faceVector.nose_apex_x || 50;
//	this.nose_apex_y = faceVector.nose_apex_y || 45;
	
	this.nose_height = faceVector.nose_height || 0.9;
	this.nose_length = faceVector.nose_length || 16;
	this.nose_width = faceVector.nose_width || 8;
	
	this.mouth_y = faceVector.mouth_y || 65;
	
	// TODO: random init;
		
};

// Constructs a random face vector.
FaceVector.prototype.shuffle = function () {
	for (var key in this) {
		if (this[key].hasOwnProperty(key)) {
			this[key] = Math.random();
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