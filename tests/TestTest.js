    
function map(a, func) {
    var out = [];
    for (var i=0; i < a.length; i++) {
    	var o = func(a[i]);
    	if (o) {
    		out.push(o);
    	}
        
    }
    return out;
};

function func(e) {
	if (e.c) return e;
};

var a = [{a:1},{b:2},{c:3}];
var b = [a[0], a[1], a[2]];

//var native = a.filter(func);
//var imp = map(a,func);
//
//console.log('IMP');
//console.log(imp);
//
//console.log('Native');
//console.log(native);
//
//
//imp[0].c = 1000;
//
//
//console.log('IMP');
//console.log(imp);
//
//
//console.log('Orig');
//console.log(a);



delete a[2];

//console.log('imp');
//console.log(imp);


console.log('Orig');
console.log(a);

console.log('b');
console.log(b);

