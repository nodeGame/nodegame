(function (exports, node) {

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
		
		this.hooks = [];
		
		this.init(this.options);
		
		// TODO: remove into a new addon
		this.listeners();
	};
	
	GameTimer.prototype.init = function (options) {
		if (this.timer) clearInterval(this.timer);
		this.milliseconds = options.milliseconds || 0;
		this.timeLeft = this.milliseconds;
		this.timePassed = 0;
		this.update = options.update || 1000;
		this.timeup = options.timeup || 'TIMEUP'; // event to be fire when timer is expired
		// TODO: update and milliseconds must be multiple now
		if (options.hooks) {
			for (var i=0; i < options.hooks.length; i++){
				this.addHook(options.hooks[i]);
			}
		}
	};
	
	/**
	 * Fire a registered hook. If it is a string it is emitted
	 * as an event, otherwise it called as a function.
	 */
	GameTimer.prototype.fire = function (h) {
		if (!h && !h.hook) return;
		var hook = h.hook || h;
		if (hook instanceof Function) {
			var ctx = h.ctx || node.game;
			hook.call(ctx);
		}
		else {
			node.emit(hook);
		}	
	};
	
	GameTimer.prototype.start = function() {
		// fire the event immediately if time is zero
		if (this.options.milliseconds === 0) {
			node.emit(this.timeup);
			return;
		}
		var that = this;
		this.timer = setInterval(function() {
			that.timePassed = that.timePassed + that.update;
			that.timeLeft = that.milliseconds - that.timePassed;
			// Fire custom hooks from the latest to the first if any
			for (var i = that.hooks.length; i > 0; i--) {
				that.fire(that.hooks[(i-1)]);
			}
			// Fire Timeup Event
			if (that.timeLeft <= 0) {
				that.fire(that.timeup);
				that.stop();
			}
			
		}, this.update);
	};
	
	/**
	 * Add an hook to the hook list after performing conformity checks.
	 * The first parameter hook can be a string, a function, or an object
	 * containing an hook property.
	 */
	GameTimer.prototype.addHook = function (hook, ctx) {
		if (!hook) return;
		var ctx = ctx || node.game;
		if (hook.hook) {
			ctx = hook.ctx || ctx;
			var hook = hook.hook;
		}
		this.hooks.push({hook: hook, ctx: ctx});
	};
	
	GameTimer.prototype.pause = function() {
		//console.log('Clearing Interval... pause')
		clearInterval(this.timer);
	};	

	GameTimer.prototype.resume = function() {
		if (this.timer) return; // timer was not paused
		var options = JSUS.extend({milliseconds: this.milliseconds - this.timePassed}, this.options);
		this.restart(options);
	};	
	
	GameTimer.prototype.stop = function() {
		//console.log('Clearing Interval... stop')
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
		
//		node.on('GAME_TIMER_START', function() {
//			that.start();
//		}); 
//		
//		node.on('GAME_TIMER_PAUSE', function() {
//			that.pause();
//		});
//		
//		node.on('GAME_TIMER_RESUME', function() {
//			that.resume();
//		});
//		
//		node.on('GAME_TIMER_STOP', function() {
//			that.stop();
//		});
		
		node.on('DONE', function(){
			that.pause();
		});
		
		// TODO: check what is right behavior for this
//		node.on('WAITING...', function(){
//			that.pause();
//		});
		
	};
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);