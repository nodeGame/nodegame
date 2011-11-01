module.exports = Utils;

function Utils(){}

Utils.getDate = function() {
	var d = new Date();
	var date = d.getUTCDate() + '-' + (d.getUTCMonth()+1) + '-' + d.getUTCFullYear() + ' ' 
			+ d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' ' 
			+ d.getMilliseconds();
	
	return date;
};

Utils.getTime = function() {
	var d = new Date();
	var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
	
	return time;
};

Utils.getListSize = function (list) {	
	var n = 0;
	for (var key in list) {
	    if (list.hasOwnProperty(key)) {
	    	n++;
	    }
	}
	
	//console.log('Calculated list length ' + n);
	
	return n;
};

// TODO: Improve - recursive
Utils.print_r = function (array) {
	for (var i=0,len=array.length;i<len;i++){
		console.log(array[i] + '\n');
	}
};