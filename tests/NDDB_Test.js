var Utils = require('../client/nodeGame/Utils.js');
module.exports.Utils = Utils.Utils;

var GameState = require('../client/nodeGame/GameState.js');
module.exports.GameState = GameState.GameState;
var GameState = GameState.GameState;

var GameBit = require('../client/nodeGame/GameStorage.js').GameBit;

var NDDB = require('../client/nodeGame/node_modules/NDDB/nddb.js').NDDB;

var nddb = new NDDB();
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

//console.log('Select Key');
//out = nddb.select('key','=','x');
//console.log(out.toString());
//
//console.log('Select !Key');
//out = nddb.select('key','!=','x');
//console.log(out.toString());
//
//console.log('Select State');
//out = nddb.select('state','>', new GameState({state: 1}));
//console.log(out.toString());

console.log('Join State');
out = nddb.concat('state','state', 'joined');
console.log(out);


//var nddb = new NDDB();
//
//var clients = ['a','b'];//['a','b','c','d'];
//var states = [1,2]; //[1,2,3,4];
//var ids = ['z','x'];//['z','x','c','v'];
//for (var i=0;i<clients.length;i++) {
//	for (var j=0;j<states.length;j++) {
//		for (var x=0;x<ids.length;x++) {
//			var objs = [{mario: 'yes', paolo: 'no', r: Math.random()}]
//			for (var o=0;o<objs.length; o++) {
//				var gb = new GameBit({clients[i], ids[x], objs[o], new GameState({state:states[j]});
//				nddb.insert(gb));
//			}
//		}
//	}
//}
//
//console.log(nddb.fetch());

//console.log('Default sort (by Player)');
//nddb.sort();
//console.log(nddb.toString());
////console.log(nddb);
//
//console.log('Reverse');
//nddb.reverse();
//console.log(nddb.toString());

//console.log('Sort by Player');
//nddb.sort();
//console.log(nddb.toString());
////console.log(nddb);
//
//console.log('Sort by State');
//nddb.sortByState();
//console.log(nddb.toString());
//
//console.log('Sort by Key');
//nddb.sortByKey();
//console.log(nddb.toString());

//console.log('Get by Player');
//var g = nddb.getByPlayer('b');
//console.log(g);
//
//console.log('Get by State');
//var g = nddb.getByState(new GameState({state:2}));
//console.log(g);
//
//console.log('Get by Key');
//var g = nddb.getByKey('z');
//console.log(g);

//console.log('Get Values');
//var v = nddb.getValues();
//console.log(v);

//console.log('Get Values (reversed)');
//nddb.reverse();
//var v = nddb.getValues();
//console.log(v);
//
//console.log('Get Value of Player \'a\'');
//var v = nddb.getValues({player: 'a'});
//console.log(v);

//console.log('Get Key-Values');
//var v = nddb.getKeyValues();
//console.log(v);

//console.log('Sort by Key-Values');
//nddb.sortByValue('r');
//
//for (var gb in nddb.storage) {
//	if (nddb.storage.hasOwnProperty(gb)) {
//		console.log(nddb.storage[gb].value);
//	}
//}

//Condition Filter
//console.log('Array Test');

//var obj = {a: 1, b: 2, c: 3, d: {a: 1, b: 2}};
//
//console.log(Utils);
//
//var ar = Utils.obj2Array(obj);
//console.log(ar);
//
//var ar = Utils.obj2KeyedArray(obj);
//console.log(ar);


//var set = nddb.split();
//console.log(set);
//console.log(nddb.size());

//set = set.select("value.r > 0.7");
//console.log(set);
//console.log(set.size());
//
//normalF = set.fetch();
//kaF = set.fetchArray();
//
//console.log('Fetch Normal');
//console.log(normalF);
//console.log('Fetch Array');
//console.log(kaF);

//console.log('FetchArray');
//var out = set.fetchArray();
//console.log(out);

//console.log('FetchValues');
//var out = set.fetchValuesArray();
//console.log(out);
//
//console.log('FetchKeyValues');
//var out = set.fetchKeyValuesArray();
//console.log(out);

//console.log('Get');
//var out = set.get();
//console.log(out);


//console.log('GameBit Test');
//
//var gb = new GameBit({state: 'a', player: '1', key: 'mamma', value: {a: 'yes', b: 'no'}});
//console.log(gb);
//
//var out = gb.split();
//console.log(out)
//
//console.log('toArray')
//var out = gb.toArray();
//console.log(out);

//console.log('Values')
//var out = gb.getValues();
//console.log(out);
//
//console.log('Values Array');
//var out = gb.getValuesArray();
//console.log(out);
//
//console.log('KeyValues');
//var out = gb.getKeyValues();
//console.log(out);
//
//console.log('KeyValues Array');
//var out = gb.getKeyValuesArray();
//console.log(out);

//console.log('Join Test');
//
//nddb = nddb.select('value.r > 0.5');
//
//var out = nddb.join('x','z','ahah');
//console.log(out);
//
//console.log('1111111111111111111111');
//var out = out.fetchArray();
//console.log(out);
