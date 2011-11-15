var GameStorage = require('../client/nodeGame/GameStorage.js').GameStorage;

var gm = new GameStorage();

var nelem = 100;
var clients = ['a','b','c','d'];
var states = [1,2,3,4];
var ids = ['z','x','c','v'];
for (var i=0;i<clients.length;i++) {
	for (var j=0;j<states.length;j++) {
		for (var x=0;x<ids.length;x++) {
			var data = {};
			data[ids[x]] = Math.random(0,1);
			gm.add(clients[i],data,states[j]);
		}
	}
}

console.log(gm);

var a = gm.get('a');
//console.log(a);

var s2 = gm.get(null,2);
//console.log(s2);

var z = gm.get(null,null,'z');
//console.log(z);

var as2 = gm.get('a',2);
console.log(as2);

var az = gm.get('a',null,'z');
//console.log(az);

var _2z = gm.get(null, 2, 'z');
console.log(_2z);
