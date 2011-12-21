var JSUS = require('../client/nodeGame/node_modules/JSUS/jsus.js').JSUS;

function A(){
	this.culo = '1';
};

A.statico = function(){};

A.prototype.a = function(){console.log(this.culo)};
A.prototype.b = function(){};
A.prototype.c = function(){};

function B(){};

B.prototype.a1 = function(){};
B.prototype.b1 = function(){};
B.prototype.c1 = function(){};



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


var o = JSUS.setNestedValue('a.b.c', 'cacca', {});
console.log(o);

var v = JSUS.getNestedValue('a.b.c', o);
console.log(v);
