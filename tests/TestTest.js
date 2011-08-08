window.onload = function() {
	
	var a = 'a';
	var u = undefined;
	var c = null;
	
	var au = a || u;
	var ac = a || c;
	
	console.log(au + ' ' + ac);
}