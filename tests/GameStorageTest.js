var GameState = require('../client/nodeGame/GameState.js');
module.exports = GameState;
var GameState = GameState.GameState;

var GameStorage = require('../client/nodeGame/GameStorage.js').GameStorage;

var gs = new GameStorage();

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
//console.log(typeof(gs));
//console.log(gs instanceof GameStorage);
//console.log(gs);

//console.log(gs.toString());

console.log('Default sort (by Player)');
gs.sort();
console.log(gs.toString());
//console.log(gs);

console.log('Reverse');
gs.reverse();
console.log(gs.toString());

console.log('Sort by Player');
gs.sort();
console.log(gs.toString());
//console.log(gs);

console.log('Sort by State');
gs.sortByState();
console.log(gs.toString());

//var a = gm.get('a');
////console.log(a);
//
//var s2 = gm.get(null,2);
////console.log(s2);
//
//var z = gm.get(null,null,'z');
////console.log(z);
//
//var as2 = gm.get('a',2);
//console.log(as2);
//
//var az = gm.get('a',null,'z');
////console.log(az);
//
//var _2z = gm.get(null, 2, 'z');
//console.log(_2z);
