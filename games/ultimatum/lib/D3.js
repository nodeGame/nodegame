(function (exports) {
	
	exports.D3	= D3;
	exports.D3ts = D3ts;
	
	D3.id = 'D3';
	D3.name = 'D3';
	D3.version = '0.1';
	D3.description = 'Real time plots for nodeGame with d3.js';
	
	D3.dependencies = {
		d3: {},	
		JSUS: {},
	};
	
	D3.defaults = {};
	
	function D3 (options) {
		
		this.id = options.id || D3.id;
		
		this.root = null;
		
		this.event = options.event || 'D3';
		
		this.svg = null;
		
		this.fieldset = {
			legend: 'D3 plot'
		};
	}
	
	D3.prototype.init = function (options) {};
	
	D3.prototype.append = function (root) {
		this.root = root;
		this.svg = d3.select(root).append("svg");
		return root;
	};
	
	D3.prototype.listeners = function () {
		var that = this;
		node.on(this.event, function (value) {
			that.tick.call(that, value); 
		});
	};
	
	// D3ts
	
	D3ts.id = 'D3ts';
	D3ts.name = 'D3ts';
	D3ts.version = '0.1';
	D3ts.description = 'Time series plot for nodeGame with d3.js';
	
	D3ts.dependencies = {
		d3: {},	
		JSUS: {},
	};
	
	D3ts.prototype.__proto__ = D3.prototype;
	D3ts.prototype.constructor = D3ts;
	
	D3ts.defaults = {};
	
	D3ts.defaults.width = 400;
	D3ts.defaults.height = 200;
	
	D3ts.defaults.margin = {
    	top: 10, 
    	right: 10, 
    	bottom: 20, 
    	left: 40 
	};
	
	D3ts.defaults.domain = {
		x: [0, 10],
		y: [0, 1]
	};
	
    D3ts.defaults.range = {
    	x: [0, D3ts.defaults.width],
    	y: [D3ts.defaults.height, 0]
    };
	
	function D3ts (options) {
		D3.call(this, options);
		
		
		var o = this.options = JSUS.merge(D3ts.defaults, options);
		
		var n = this.n = o.n;
		
	    this.data = [0];
	    
	    this.margin = o.margin;
	    
		var width = this.width = o.width - this.margin.left - this.margin.right;
		var height = this.height = o.height - this.margin.top - this.margin.bottom;

		// identity function
		var x = this.x = d3.scale.linear()
		    .domain(o.domain.x)
		    .range(o.range.x);

		var y = this.y = d3.scale.linear()
		    .domain(o.domain.y)
		    .range(o.range.y);

		// line generator
		this.line = d3.svg.line()
		    .x(function(d, i) { return x(i); })
		    .y(function(d, i) { return y(d); });
	}
	
	D3ts.prototype.init = function (options) {
		//D3.init.call(this, options);
		
		console.log('init!');
		var x = this.x,
			y = this.y,
			height = this.height,
			width = this.width,
			margin = this.margin;
		
		
		// Create the SVG and place it in the middle
		this.svg.attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		// Line does not go out the axis
		this.svg.append("defs").append("clipPath")
		    .attr("id", "clip")
		  .append("rect")
		    .attr("width", width)
		    .attr("height", height);

		// X axis
		this.svg.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + height + ")")
		    .call(d3.svg.axis().scale(x).orient("bottom"));

		// Y axis
		this.svg.append("g")
		    .attr("class", "y axis")
		    .call(d3.svg.axis().scale(y).orient("left"));

		this.path = this.svg.append("g")
		    .attr("clip-path", "url(#clip)")
		  .append("path")
		    .data([this.data])
		    .attr("class", "line")
		    .attr("d", this.line);		
	};
	
	D3ts.prototype.tick = function (value) {
		this.alreadyInit = this.alreadyInit || false;
		if (!this.alreadyInit) {
			this.init();
			this.alreadyInit = true;
		}
		
		var x = this.x;
		
		console.log('tick!');
	
		// push a new data point onto the back
		this.data.push(value);

		// redraw the line, and slide it to the left
		this.path
	    	.attr("d", this.line)
	    	.attr("transform", null);

		// pop the old data point off the front
		if (this.data.length > this.n) {
		
	  		this.path
	  			.transition()
	  			.duration(500)
	  			.ease("linear")
	  			.attr("transform", "translate(" + x(-1) + ")");
	  		
	  		this.data.shift();
	  	  
		}
	};
	
})(node.window.widgets);