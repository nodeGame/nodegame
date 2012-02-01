(function (exports, node) {

//	/*
//	 * History
//	 * 
//	 * Sends DATA msgs
//	 * 
//	 */
//	
//	exports.History = History;
//	
//	JSUS = node.JSUS;
//	
//	History.id = 'History';
//	History.name = 'History';
//	History.version = '0.1';
//	
//	History.dependencies = {
//		JSUS: {},
//		NDDB: {}
//	};
//	
//	History.prototype = new NDDB();
//	History.prototype.constructor = History;
//	
//	function History (options, data) {
//		NDDB.call(this, options, data); 
//		var options = options || {};
//		this.options = options;
//		
//		this.history = [];
//		
//		this.init(this.options);
//		
//	};
//	
//	History.prototype.init = function (options) {
//		
//	};
//	
//	
//	History.prototype.start = function() {
//		// fire the event immediately if time is zero
//		if (this.options.milliseconds === 0){
//			node.emit(this.timeup);
//			return;
//		}
//		var that = this;
//		this.timer = setInterval(function() {
//			that.timePassed = that.timePassed + that.update;
//			that.timeLeft = that.milliseconds - that.timePassed;
//			
//			// Fire custom hooks from the latest to the first if any
//			for (var i = that.hooks.length; i> 0; i--) {
//				that.fire(that.hooks[(i-1)]);
//			}
//			// Fire Timeup Event
//			if (that.timeLeft <= 0) {
//				that.fire(that.timeup);
//				that.stop();
//			}
//			
//		}, this.update);
//	};
//	
//	/**
//	 * Add an hook to the hook list after performing conformity checks.
//	 * The first parameter hook can be a string, a function, or an object
//	 * containing an hook property.
//	 */
//	History.prototype.addHook = function (hook, ctx) {
//		if (!hook) return;
//		var ctx = ctx || node.game;
//		if (hook.hook) {
//			ctx = hook.ctx || ctx;
//			var hook = hook.hook;
//		}
//		this.hooks.push({hook: hook, ctx: ctx});
//	};
//	
//	History.prototype.pause = function() {
//		clearInterval(this.timer);
//	};	
//
//	History.prototype.resume = function() {
//		if (this.timer) return; // timer was not paused
//		var options = JSUS.extend({milliseconds: this.milliseconds - this.timePassed}, this.options);
//		this.restart(options);
//	};	
//	
//	History.prototype.stop = function() {
//		clearInterval(this.timer);
//		this.timePassed = 0;
//		this.timeLeft = null;
//	};	
//	
//	History.prototype.restart = function (options) {
//		var options = options || this.options;
//		this.init(options);
//		this.start();
//	};
			
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);