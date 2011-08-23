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
}

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

	
	//	this.draw_eyebrow(g, face.p[4]);
//	this.draw_nose(g, face.p[5]);
//	this.draw_mouth(g, face.p[6], face.p[9], face.p[10]);
};		
		
FacePainter.prototype.drawOval = function (settings) {
	
	var x = settings.x || this.centerX;
	var y = settings.y || this.centerY;

	var radius = settings.radius || 100;
	var eccentricity = settings.eccentricity;
	
	var lineWidth = settings.lineWidth = settings.lineWidth || 1;
	var color = settings.color || '#000000';
	
	console.log('X,Y(' + x + ', ' + y + '); Radius: ' + radius + ', Ecc.: ' + eccentricity);
	
	this.ctx.lineWidth = lineWidth;
	this.ctx.strokeStyle = color;
	
	this.ctx.save();
	this.ctx.scale(eccentricity, 1);
	this.ctx.beginPath();
	this.ctx.arc(x, y, radius, 0, Math.PI*2, false);
	this.ctx.stroke();
	this.ctx.closePath();
	this.ctx.restore();
}

FacePainter.prototype.drawHead = function (face, x, y) {
	
	var radius = face.head_radius;
	var eccentricity = 1 || face.head_eccentricity;
	
	this.drawOval({
				   x: x, 
				   y: y,
				   radius: radius,
				   eccentricity: eccentricity,
				   lineWidth: 4,
				   color: '#FF0000'
	});
};

FacePainter.prototype.drawEyes = function (face, x, y) {

	
	var spacing = face.eye_spacing;
	var radius = face.eye_radius;
	var eccentricity = face.eye_eccetricity;

	this.drawOval({
					x: x-spacing,
					y: y,
					radius: radius,
					eccentricity: eccentricity
	});
	
	this.drawOval({
					x: x+spacing,
					y: y,
					radius: radius,
					eccentricity: eccentricity
	});
}

	

FacePainter.prototype.drawPupils = function (face, x, y) {
		
	var radius = face.pupil_radius;
	var eccentricity = 1 || face.eye_pupils_eccetricity;
	
	this.drawOval({
					x: face.eye_left - (radius/2),
					y: y + (radius/2),
					radius: radius,
					eccentricity: eccentricity,
					color: '#black'
	});
	
	this.drawOval({
					x: x - (radius/2),
					y: y + (radius/2),
					radius: radius,
					eccentricity: eccentricity,
					color: '#black'
	});
	
//		xFillOval(g, eye_left_x - (int)((p7 - 0.5) * 10), eye_y, pupil_size, pupil_size);
//		xFillOval(g, eye_right_x + (int)((p7 - 0.5) * 10), eye_y, pupil_size, pupil_size);
}
	

//	protected void draw_eyebrow (Graphics g, double p4) {
//		int y1 = eyebrow_y + (int)((p4 - 0.5) * 10);
//		int y2 = eyebrow_y - (int)((p4 - 0.5) * 10);
//		
//		xLine(g, eyebrow_l_l_x, y1, eyebrow_l_r_x, y2);
//		xLine(g, eyebrow_r_l_x, y2, eyebrow_r_r_x, y1);
//	}
//
//
//	protected void draw_nose (Graphics g, double p5) {
//		int y = 55 + (int)(((p5 - 0.5) / 2.0) * 10);
//		
//		xLine(g, nose_apex_x, nose_apex_y, nose_apex_x - (nose_width / 2), y);
//		xLine(g, nose_apex_x - (nose_width / 2), y, nose_apex_x + (nose_width / 2), y);
//		xLine(g, nose_apex_x + (nose_width / 2), y, nose_apex_x, nose_apex_y);
//	}
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
	this.head_eccentricity = faceVector.head_radius || 0.75;
	
	this.eye_height = faceVector.eye_height || 3; // TODO: Here
	this.eye_radius = faceVector.eye_radius || 5;
	this.eye_left_x = faceVector.eye_left_x || 40;
	this.eye_right_x = faceVector.eye_right_x || 60;
	this.eye_spacing = faceVector.eye_spacing || 10;
	this.eye_eccentricity = faceVector.eye_eccentricity || 1;
	
	this.pupil_radius = faceVector.pupil_radius || 0.2 * this.eye_radius;
	
	this.eyebrow_l_l_x = faceVector.eyebrow_l_l_x || 35;
	this.eyebrow_r_l_x = faceVector.eyebrow_r_l_x || 55;
	this.eyebrow_l_r_x = faceVector.eyebrow_l_r_x || 45;
	this.eyebrow_r_r_x = faceVector.eyebrow_r_r_x || 65;
	this.eyebrow_y = faceVector.eyebrow_y || 30;
	
	this.nose_apex_x = faceVector.nose_apex_x || 50;
	this.nose_apex_y = faceVector.nose_apex_y || 45;
	this.nose_height = faceVector.nose_height || 16;
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