(function (JSUS) {
	
	function TIME() {};

    TIME.getDate = function() {
		var d = new Date();
		var date = d.getUTCDate() + '-' + (d.getUTCMonth()+1) + '-' + d.getUTCFullYear() + ' ' 
				+ d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' ' 
				+ d.getMilliseconds();
		
		return date;
	};
	
	TIME.getTime = function() {
		var d = new Date();
		var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
		
		return time;
	};
	
	/**
	 * Returns an array days, minutes, seconds, mi
	 * @param ms time in milliseconds
	 * @return array 
	 */
	TIME.parseMilliseconds = function (ms) {
	  
		var result = [];
		var x = ms / 1000;
		result[4] = x;
		var seconds = x % 60;
		result[3] = Math.floor(seconds);
		var x = x /60;
		var minutes = x % 60;
		result[2] = Math.floor(minutes);
		var x = x / 60;
		var hours = x % 24;
		result[1] = Math.floor(hours);
		var x = x / 24;
		var days = x;
		result[1] = Math.floor(days);
		
	    return result;
	};
	
	JSUS.extend(TIME);
	
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);