(function (exports, node) {
	
	// TODO: check whether we still need a util class for nodegame
	
	/**
	 * Expose constructor
	 * 
	 */
	exports.Utils = ('undefined' !== typeof JSU) ? JSU : node.JSU;

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
