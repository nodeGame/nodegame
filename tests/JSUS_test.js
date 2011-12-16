var JSUS = require('../client/nodeGame/node_modules/JSUS/jsus.js').JSUS;

function A(){};

A.statico = function(){};

A.prototype.a = function(){console.log('CULO')};
A.prototype.b = function(){};
A.prototype.c = function(){};

function B(){};

B.prototype.a1 = function(){};
B.prototype.b1 = function(){};
B.prototype.c1 = function(){};

//console.log(A.prototype);


JSUS.extend(A, B);

//console.log(B);
//
//
//var bb = new B();
//
//console.log(bb);
//
//bb.a();
//
//console.log(JSUS);