(function (exports, node) {
	
	console.log(node);
	/*
	 * GameTimer
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.GameTimer = GameTimer;
	
	JSUS = node.JSUS;
	
	function GameTimer (options) {
		var options = options || {};
		this.options = options;
		
		this.timer = null; 		// the ID of the interval
		this.timeLeft = null;
		this.timePassed = 0;
		
		this.init(this.options);
	};
	
	GameTimer.prototype.init = function (options) {
		if (this.timer) clearInterval(this.timer);
		this.milliseconds = options.milliseconds || 0;
		this.timeLeft = this.milliseconds;
		this.timePassed = 0;
		this.update = options.update || 1000;
		this.event = options.event || 'TIMEUP'; // event to be fire		
		// TODO: update and milliseconds must be multiple now
		
		this.listeners();
	};
	
	GameTimer.prototype.fire = function() {
		if (!this.event) return;
		if (this.event instanceof Function) {
			this.event.call(node.game);
			return;
		}
		node.emit(this.event);
	};
	
	GameTimer.prototype.start = function() {
		// fire the event immediately if time is zero
		if (this.options.milliseconds === 0){
			node.emit(this.event);
			return;
		}
		var that = this;
		this.timer = setInterval(function() {
			that.timePassed = that.timePassed + that.update;
			that.timeLeft = that.milliseconds - that.timePassed;
			if (that.timeLeft <= 0) {
				that.fire();
				that.stop();
			}
			
		}, this.update);
	};
	
	GameTimer.prototype.pause = function() {
		clearInterval(this.timer);
	};	

	GameTimer.prototype.resume = function() {
		if (this.timer) return; // timer was not paused
		var options = JSUS.extend({milliseconds: this.milliseconds - this.timePassed}, this.options);
		this.restart(options);
	};	
	
	GameTimer.prototype.stop = function() {
		clearInterval(this.timer);
		this.timePassed = 0;
		this.timeLeft = null;
	};	
	
	GameTimer.prototype.restart = function (options) {
		var options = options || this.options;
		this.init(options);
		this.start();
	};
		
	GameTimer.prototype.listeners = function () {
		var that = this;
		
		node.on('GAME_TIMER_START', function() {
			that.start();
		}); 
		
		node.on('GAME_TIMER_PAUSE', function() {
			that.pause();
		});
		
		node.on('GAME_TIMER_RESUME', function() {
			that.resume();
		});
		
		node.on('GAME_TIMER_STOP', function() {
			that.stop();
		});
		
	};
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);