(function (exports) {
	
	exports.D3	= D3;
	exports.D3ts = D3ts;
	
	D3.id = 'D3';
	D3.name = 'D3';
	D3.version = '0.1';
	D3.description = 'Real time plots for nodeGame with d3.js';
	
	D3.dependencies = {
		D3: {},	
	};
	
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
		this.svg = d3.select(root).append("svg");
		return root;
	};
	
	D3.prototype.listeners = function () {
		console.log(this.event)
		console.log(this.tick)
		var that = this;
		node.on(this.event, function(value) {
			that.tick.call(that, value); 
		});
	};
	
	// D3ts
	
	D3ts.id = 'D3ts';
	D3ts.name = 'D3ts';
	D3ts.version = '0.1';
	D3ts.description = 'Time series plot for nodeGame with d3.js';
	
	D3ts.dependencies = {
		D3: {},	
	};
	
	D3ts.prototype.__proto__ = D3.prototype;
	D3ts.prototype.constructor = D3ts;
	
	function D3ts (options) {
		D3.call(this, options);
		
		var n = this.n = options.n || 40;
		
	    var random = d3.random.normal(0, .2);
	    
	    this.data = d3.range(n).map(random);
	    this.data.splice(0,41);
	
		    
	    this.margin = {top: 10, right: 10, bottom: 20, left: 20};
		
		var width = this.width = 960 - this.margin.left - this.margin.right;
		var height = this.height = 500 - this.margin.top - this.margin.bottom;

		var x = this.x = d3.scale.linear()
		    .domain([0, n - 1])
		    .range([0, width]);

		var y = this.y = d3.scale.linear()
		    .domain([0, 1])
		    .range([height, 0]);

		this.line = d3.svg.line()
		    .x(function(d, i) { return x(i); })
		    .y(function(d, i) { return y(d); });
	}
	
	D3ts.prototype.init = function (options) {
		//D3.init.call(this, options);
		
		console.log('init!');
		var x = this.x,
			y = this.y;
		
		// Create the SVG and place it in the middle
		this.svg.attr("width", this.width + this.margin.left + this.margin.right)
		    .attr("height", this.height + this.margin.top + this.margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


		// Line does not go out the axis
		this.svg.append("defs").append("clipPath")
		    .attr("id", "clip")
		  .append("rect")
		    .attr("width", this.width)
		    .attr("height", this.height);

		// X axis
		this.svg.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + this.height + ")")
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
			this.alreadyInit = false;
		}
		
		var x = this.x;
		
		console.log('tick!');
	
		// push a new data point onto the back
		this.data.push([[value]]);

		// redraw the line, and slide it to the left
		this.path
	    	.attr("d", this.line)
	    	.attr("transform", null);

		// pop the old data point off the front
		if (this.data.length > this.n) {
			this.data.shift();
	  
	  		this.path
	  			.transition()
	  			.duration(500)
	  			.ease("linear")
	  			.attr("transform", "translate(" + x(-1) + ")");
		}
	};
	
})(node.window.widgets);