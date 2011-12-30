var GameState = require('../client/nodeGame/GameState.js');
module.exports.GameState = GameState.GameState;
var Utils = require('../client/nodeGame/Utils.js');
module.exports.Utils = Utils.Utils;
var JSUS = require('../client/nodeGame/node_modules/JSUS/jsus.js');
module.exports.JSUS = JSUS.JSUS;
var NDDB = require('../client/nodeGame/node_modules/NDDB/nddb.js');
module.exports.NDDB = NDDB.NDDB;
var Table = require('../client/nodeWindow/Table.js');

module.exports.Table = Table;


//var GameState = GameState.GameState;
//var GameStorage = require('../client/nodeGame/GameStorage.js').GameStorage;
//var GameBit = require('../client/nodeGame/GameStorage.js').GameBit;

var data = [1,2,3]; 
var dims = ['x','y','z'];

var t = new Table({});

//t._add(data, dims);
//t._add(data, dims);
//t._add(data, dims);

for (var i=0.1; i<5; i++) {
	var a = [i,'a'];
	t.addColumn(a);
}

t.sort('y');
t.reverse();
console.log(t.pointers);
console.log(t.fetch());
console.log(t.parse());



