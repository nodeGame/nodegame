(function (exports) {
	
	
	/*
	 * VisualTimer
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.VisualTimer	= VisualTimer;
	
	JSUS = node.JSUS;
	
	VisualTimer.id = 'visualtimer';
	VisualTimer.name = 'Visual Timer';
	VisualTimer.version = '0.3.2';
	
	VisualTimer.dependencies = {
		GameTimer : {},
		JSUS: {}
	};
	
	function VisualTimer (options) {
		this.options = options;
		this.id = options.id;

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
		var that = this;
		(function initHooks() {
			if (options.hooks) {
				if (!options.hooks instanceof Array) {
					options.hooks = [options.hooks];
				}
			}
			else {
				options.hooks = [];
			}
			
			options.hooks.push({hook: that.updateDisplay,
								ctx: that
			});
		})();
		
		
		this.gameTimer = (options.gameTimer) || new node.GameTimer();
		
		if (this.gameTimer) {
			this.gameTimer.init(options);
		}
		else {
			node.log('GameTimer object could not be initialized. VisualTimer will not work properly.', 'ERR');
		}
		
		
	};
	
	VisualTimer.prototype.append = function (root) {
		this.root = root;
		this.timerDiv = node.window.addDiv(root, this.id + '_div');
		this.updateDisplay();
		return root;	
	};
	
	VisualTimer.prototype.updateDisplay = function () {
		if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0) {
			this.timerDiv.innerHTML = '0:0';
			return;
		}
		var time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
		time = JSUS.parseMilliseconds(time);
		this.timerDiv.innerHTML = time[2] + ':' + time[3];
	};
	
	VisualTimer.prototype.start = function() {
		this.updateDisplay();
		this.gameTimer.start();
	};
	
	VisualTimer.prototype.restart = function(options) {
		this.init(options);
		this.start();
	};
	
	VisualTimer.prototype.stop = function(options) {
		this.gameTimer.stop();
	};
	
	VisualTimer.prototype.resume = function(options) {
		this.gameTimer.resume();
	};
		
	VisualTimer.prototype.listeners = function () {
		var that = this;
		node.on('LOADED', function() {
			var timer = node.game.gameLoop.getAllParams(node.game.gameState).timer;
			if (timer) {
				that.timerDiv.className = '';
				var options = ('number' === typeof timer) ? {milliseconds: timer} : timer;
				if (!options.timeup) {
					options.timeup = 'DONE';
				}
				
				that.gameTimer.init(options);
				that.start();
			}
		});
		
		node.on('DONE', function(){
			that.timerDiv.className = 'strike';
		})
	};
	
})(node.window.widgets);