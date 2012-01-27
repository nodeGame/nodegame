(function (exports) {
	
	
	/*
	 * VisualTimer
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.VisualTimer	= VisualTimer;
	
	JSUS = node.JSUS;
	
	VisualTimer.name = 'Visual Timer';
	VisualTimer.version = '0.3.2';
	VisualTimer.dependencies = {
		GameTimer : {},
		JSUS: {}
	};
	
	function VisualTimer (options) {
		this.options = options;

		this.id = options.id || 'visualtimer';

		this.gameTimer = null
		
		this.timerDiv = null; 	// the DIV in which to display the timer
		this.root = null;		// the parent element
		this.fieldset = { legend: 'Time to go',
						  id: this.id + '_fieldset'
		};
		
		this.init(this.options);
	};
	
	VisualTimer.prototype.init = function (options) {
		var options = options || this.options;
		if (options.hooks) {
			if (!options.hooks instanceof Array) {
				options.hooks = [options.hooks];
			}
			options.hooks.push(this.updateDisplay);
		}
		this.gameTimer = options.gameTimer || new node.GameTimer(options);
	};
	
	VisualTimer.prototype.append = function (root) {
		this.root = root;
		this.timerDiv = node.window.addDiv(root, this.id + '_div');
		return root;	
	};
	
	VisualTimer.prototype.updateDisplay = function () {
		var time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
		time = JSUS.parseMilliseconds(time);
		this.timerDiv.innerHTML = time[2] + ':' + time[3];
	};
	
	VisualTimer.prototype.start = function() {
		if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0){
			this.timerDiv.innerHTML = '0:0';
			return;
		}
		this.gameTimer.start();
	};
	
	VisualTimer.prototype.restart = function(options) {
		this.init(options);
		this.gameTimer.start();
	};
	
	VisualTimer.prototype.stop = function(options) {
		this.gameTimer.stop();
	};
	
	VisualTimer.prototype.resume = function(options) {
		this.gameTimer.resume();
	};
		
	VisualTimer.prototype.listeners = function () {};
	
})(node.window.widgets);