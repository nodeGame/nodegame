(function (exports, node) {

	/*
	 * NoiseCreator
	 * 
	 * Sends DATA msgs
	 * 
	 */
	
	exports.NoiseCreator = NoiseCreator;
	
	JSUS = node.JSUS;
	
	function NoiseCreator (options) {
		var options = options || {};
		this.options = options;
		
		this.hooks = [];
		
		this.init(this.options);
		
		// TODO: remove into a new addon
		this.listeners();
	};
	
	NoiseCreator.prototype.init = function (options) {
		if (this.timer) clearInterval(this.timer);
		
		
	};
	
	NoiseCreator.prototype.noiseUp = function () {
		
	};
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);