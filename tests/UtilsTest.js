
var utils = require('../client/nodeGame/Utils.js').Utils;

var numbers = [1,2,3,4,5];
var letters = ['a','b','c','d','e'];
var biggroup = [1,2,3,4,5,6,7,8,9,0];

var func = function(a) {
	console.log(a);
}

//var out = utils.generateCombinations(letters,2,func);


//var out = utils.getRandom(letters,2);
//console.log(out);

//var out = utils.getNGroups(biggroup, 3);
//console.log(out);

//var out = utils.getGroupsSizeN(biggroup, 4);
//console.log(out);

//var out = utils.getNRandom(biggroup, 4);
//console.log(out);

//var out = utils.matchN(biggroup, 4);
//console.log(out);


var obj1 = {a: 1, b: 2, c:3};
var obj2 = {a: 9, b: 8, d:7};

var out = utils.clone(obj1);
console.log(out);

var out = utils.join(obj1,obj2);
console.log(out);

var out = utils.merge(obj1,obj2);
console.log(out);