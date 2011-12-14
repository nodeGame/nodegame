var Utils = require('../client/nodeGame/Utils.js');
module.exports.Utils = Utils.Utils;

console.log(Utils);

//var GameState = require('../client/nodeGame/GameState.js');
//module.exports.GameState = GameState.GameState;
//var GameState = GameState.GameState;

var NDDB = require('../client/nodeGame/node_modules/NDDB/nddb.js').NDDB;
console.log(NDDB);

var nddb = new NDDB();

var clients = ['a','b'];//['a','b','c','d'];
var states = [1,2]; //[1,2,3,4];
var ids = ['z','x'];//['z','x','c','v'];

for (var i=0;i<clients.length;i++) {
	for (var j=0;j<states.length;j++) {
		for (var x=0;x<ids.length;x++) {
			gs.add(clients[i], ids[x], Math.random(0,1), new GameState({state:states[j]}));
		}
	}
}