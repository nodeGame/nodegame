(function(exports) {
	
	/*!
	 * Canvas
	 * 
	 */ 
	
	exports.Canvas = Canvas;
	
	function Canvas(canvas) {
		this.canvas = canvas;
		// 2D Canvas Context 
		this.ctx = canvas.getContext('2d');
		
		this.centerX = canvas.width / 2;
		this.centerY = canvas.height / 2;
		
		this.width = canvas.width;
		this.height = canvas.height;
		
//		console.log(canvas.width);
//		console.log(canvas.height);		
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
})(node.window);