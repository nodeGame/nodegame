var JSUS = require('../client/nodeGame/node_modules/JSUS/jsus.js').JSUS;

var a = [1,2,3,4,5,6];
var b = ['a','b','c','d','e','g'];
var c = [1, 'b', 3, 'd', 5, 'g'];

//var o = JSUS.arrayDiff(c,b);
//console.log(o);



var a = [{a:1},{a:1},{b:1},{c:2},{c: 'b'},{h:{c:1}},6];
//var b = ['a','b',{a:1},'d','e','g'];
//var c = [1, 'b', 3, 'd', 5, 'g'];
//
//
//var o = JSUS.arrayDiff(a,c);
//console.log(o);


for (var i=0; i < 1000000; i++) {
	var g = JSUS.matchN(a,1,true);
	var test = [];
	for (var j=0; j<g.length;j++) {
		if (!JSUS.in_array(g[j],test)) {
			test.push(g[j]);
		}
		else {
			console.log(g);
			console.log('ERR');
		}
	}
}


//function A(){
//	this.culo = '1';
//};
//
//A.statico = function(){};
//
//A.prototype.a = function(){console.log(this.culo)};
//A.prototype.b = function(){};
//A.prototype.c = function(){};
//
//function B(){};
//
//B.prototype.a1 = function(){};
//B.prototype.b1 = function(){};
//B.prototype.c1 = function(){};




//var aa = new A();
//
//
//
//console.log(typeof A);
//console.log(typeof aa);
//
//console.log(A.prototype);
//
//
//console.log(aa.prototype);
//
//for (var i in A) {
//	console.log(i);
//}

//console.log(A.prototype.__proto__);
//console.log(aa.prototype.__proto__);



//JSUS.extend(A, B);

//console.log(B);


//var bb = new B();
//console.log('pre');
//console.log(bb);
//
//JSUS.extend(A,bb);
//console.log('post');
//console.log(bb);
//
//bb.a1();
//bb.a();


//var o = JSUS.setNestedValue('a.b.c', 'cacca', {});
//console.log(o);
//
//var v = JSUS.getNestedValue('a.r.t', o);
//console.log(v);
