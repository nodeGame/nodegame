window = {};
window.node = {};
module.exports.node = {};
module.exports.node.window = {};


var GameState = require('../client/nodeGame/GameState.js');
module.exports.GameState = GameState.GameState;
var Utils = require('../client/nodeGame/Utils.js');
module.exports.Utils = Utils.Utils;
var JSUS = require('../client/nodeGame/node_modules/JSUS/jsus.js');
module.exports.JSUS = JSUS.JSUS;
var NDDB = require('../client/nodeGame/node_modules/NDDB/nddb.js');
module.exports.NDDB = NDDB.NDDB;

var Document = require('../client/nodeWindow/Document.js');
module.exports.Document = Document;

var GameWindow = require('../client/nodeWindow/GameWindow.js');
module.exports.node.window = GameWindow;

var Table = require('../client/nodeWindow/Table.js');
module.exports.Table = Table;


//var GameState = GameState.GameState;
//var GameStorage = require('../client/nodeGame/GameStorage.js').GameStorage;
//var GameBit = require('../client/nodeGame/GameStorage.js').GameBit;

var data = [1,2,3]; 
var dims = ['x','y','z'];

var t = new Table({});


t._add(data, dims);
t._add(data, dims);
t._add(data, dims);

//for (var i=0.1; i<5; i++) {
//	var a = [i,'a'];
//	t.addColumn(a);
//}
//
//console.log(t.fetch());
//
//t.addClass('culo2');

t.select('x','>',1)
 .addClass(['culo','c2']);

console.log('--');
console.log(t.fetch());

t.removeClass('culo');
console.log('--');
console.log(t.fetch());




//t.addColumn([1,'a']);
//t.addColumn([2]);
//t.addColumn([3,'c']);
//t.addColumn([3]);
//
//
//
//t.sort('x');
//t.reverse();
//console.log(t.pointers);
//console.log(t.fetch());
////console.log(t.parse());
//
//t.addColumn([2,2,2]);
//
//
//aa = t.select('x','>',2);
//
//aa.addColumn([1,2]);
//console.log(aa.fetch());

