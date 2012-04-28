var Utils = require('../server/node_modules/nodegame-server/node_modules/nodegame-client/Utils.js');
module.exports.Utils = Utils.Utils;
var JSUS = require('../server/node_modules/nodegame-server/node_modules/nodegame-client/node_modules/JSUS/jsus.js');
module.exports.JSUS = JSUS.JSUS;

var GameState = require('../server/node_modules/nodegame-server/node_modules/nodegame-client/GameState.js');
module.exports.GameState = GameState.GameState;
var GameState = GameState.GameState;

var GameBit = require('../server/node_modules/nodegame-server/node_modules/nodegame-client/GameDB.js').GameBit;

var NDDB = require('../server/node_modules/nodegame-server/node_modules/nodegame-client/node_modules/NDDB/nddb.js').NDDB;
module.exports.NDDB = NDDB;

module.exports.Utils = JSUS.JSUS;

var PlayerList = require('../server/node_modules/nodegame-server/node_modules/nodegame-client/PlayerList.js').PlayerList;

var log = function (txt, level) {
	var level = level || 'INFO';
	console.log(txt);
};



var nddb = new NDDB({log: log});
nddb.set('state', GameBit.compareState);

var clients = ['a','b'];//['a','b','c','d'];
var states = [1,2]; //[1,2,3,4];
var ids = ['z','x'];//['z','x','c','v'];


for (var i=0;i<clients.length;i++) {
	for (var j=0;j<states.length;j++) {
		for (var x=0;x<ids.length;x++) {
			var gb = new GameBit({player: clients[i],
								  key: ids[x],
								  value: Math.random(0,1),
								  state: new GameState({state:states[j]})
			});
			
			nddb.insert(gb);
		}
	}
}

//console.log(nddb.toString());
//
//console.log('Default sort');
//var out = nddb.sort();
//console.log(out.toString());
//
//
//console.log('Reverse');
//out = nddb.reverse();
//console.log(out.toString());
//
//console.log('Sort by Player');
//nddb.sort('player');
//console.log(out.toString());
//
//console.log('Sort by State');
//out = nddb.sort('state');
//console.log(out.toString());
//
//console.log('Sort by Key');
//out = nddb.sort('key');
//console.log(out.toString());

//console.log('Get by value');
//out = nddb.sort('value');
//console.log(out.toString());

console.log('Select Key');
out = nddb.select('key','=','x');
console.log(out.toString());

//console.log('Select !Key');
//out = nddb.select('key','!=','x');
//console.log(out.toString());
//
//console.log('Select State');
//out = nddb.select('state','>', new GameState({state: 1}));
//console.log(out.toString());

//console.log('Join State');
//out = nddb.join('state','state', 'joined');
//console.log(out.fetch());

//console.log('Join State Selective');
//out = nddb.join('state','state', 'joined', ['key']);
////console.log(out.fetch());
//
//console.log('Get First');
//console.log(out.first());
//
//console.log('Get Last');
//console.log(out.last());
//
//console.log('Limit 1');
//console.log(out.limit(1));
//
//console.log('Limit -1');
//console.log(out.limit(-1));

nddb.clear(true);
//console.log(nddb.fetch());

var clients = ['a','b'];//['a','b','c','d'];
var states = [1,2]; //[1,2,3,4];
var ids = ['z','x'];//['z','x','c','v'];
for (var i=0;i<clients.length;i++) {
	for (var j=0;j<states.length;j++) {
		for (var x=0;x<ids.length;x++) {
			var p = Math.random();
			if (p>0.5) {
				var objs = [{mario: (p>0.5) ? 'yes' : 'no', paolo: (p>0.5) ? 'no' : 'yes', k: '10', r: Math.random()}];
			}
			else {
				var objs = [{mario: (p>0.5) ? 'yes' : 'no', paolo: (p>0.5) ? 'no' : 'yes', r: Math.random()}];
			}
			            
			for (var o=0;o<objs.length; o++) {
				var gb = new GameBit({player: clients[i],
									  key: ids[x],
									  value: objs[o],
									  state: new GameState({state:states[j]})
				});
				nddb.insert(gb);
			}
		}
	}
}


//var v = nddb.fetch();

//console.log(v);

//console.log(nddb.insert.toString())
//
//for (var i=0; i<v.length; i++) {
//	console.log(v[i].prototype);
//}


//var v = nddb.select('key','=','x');
//console.log(v);

//var v = nddb.select('value.k');
//console.log(v.fetch());

//out = nddb.split('value');
//console.log(out.fetch());

//console.log('Group By');
//v = nddb.groupBy('value.k');
//console.log(v);
//
//for (var i=0; i<v.length; i++) {
//	console.log(v[i].fetch('value'));
//}

//
//console.log('Fetch');
//v = nddb.fetch('value.r');
//console.log(v);
//
//v = nddb.sum('value.r'); 
//console.log(v);


//var v = nddb.sort('x');
//console.log(v);

//var v = nddb.sort(['state','value.r']);
//console.log(v.fetch());

//var v = nddb.select('value.r', '<>', [0.2,0.9]);
//console.log(v.fetch());


//var v = nddb.select('value.r', '><', [0.4,0.5]);
//console.log(v.fetchValues());

//var v = nddb.select('value.mario', '=', 'yes');
//console.log(v);
//console.log(v.fetch());

//v.delete();
//
//console.log(nddb);
//console.log(nddb.size());

//for (var i=0; i < nddb.size(); i++) {
//	console.log('e');
//	console.log(nddb.db[i].prototype);
//}

//a = [1,2,3];
//b = a;
//
//c = b.filter(function(elem){if (elem>1) return elem});
//
//for (var i=0; i<c.length; i++) {
//	var t = c[i];
//	t = undefined;
//	c[i] = undefined;
//}
//
//console.log(a);
//console.log(b);
//console.log(c);
//
//
//
//
//var db = [{a:1},{b:2},{b:3}];
//
//function O (db){
//	this.db = db;
//	this.count = -1;
//}

//O.prototype.delete = function(){
//	//delete this.db[this.count++];
//	this.db.splice(0,this.db.length);
//}
//
//var o = new O(db);
//
//var o2 = new O(o.db);
//
//
//
//o2.db.push({c: 3});
//o2.delete();
//
//console.log(o);
//console.log(o2);




//var o = new Function();
//
//console.log(o.prototype);


//var pl = new PlayerList({}, nddb.db);
//pl.add({id:124123523423});

//var v = pl.fetch();
//for (var i=0; i < v.length; i++) {
//console.log(v[i].__proto__);
//}
//
//for (var i=0; i < v.length; i++) {
//	console.log(v[i]);
//}


//console.log(pl.fetch());


//var nddb2 = JSUS.JSUS.clone(nddb.db);


//console.log('TESTING DIFF and INTERSECT');
//var a = pl.diff(nddb2.db);
//var b = pl.intersect(nddb2.db);
//console.log(a.fetch());
//console.log(b.size());


//console.log(nddb.get(2).nddbid);
//console.log(pl.get(2));
//
//var o = pl.select('count','=',1);
//
//var v = pl.fetch();
//for (var i=0; i < v.length; i++) {
//	console.log(v[i].nddbid);
//}
//var v = nddb.fetch();
//for (var i=0; i < v.length; i++) {
//	console.log(v[i].nddbid);
//}

//var g = nddb.get();
//while (g) {
//	console.log(g);
//	console.log('N');
//	g = nddb.next();
//}
//
//console.log(nddb.nddb_pointer);
//console.log(nddb.size());
//
//
//g = nddb.previous();
//while (g) {
//	console.log(g);
//	console.log('P');
//	g = nddb.previous();
//}

//var culo = 'CULO';
//
//var o = function(a){
//	var oo = nddb.map(function(el){
//		return [el,a];
//	}, a);
//	console.log(oo);
//}(culo);




