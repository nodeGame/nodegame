var GameState = require('../client/nodeGame/GameState.js');
module.exports.GameState = GameState.GameState;
var Utils = require('../client/nodeGame/Utils.js');
module.exports.Utils = Utils.Utils;
var JSUS = require('../client/nodeGame/node_modules/JSUS/jsus.js');
module.exports.JSUS = JSUS.JSUS;

var NDDB = require('../client/nodeGame/node_modules/NDDB/nddb.js').NDDB;
module.exports.NDDB = NDDB;

var GameState = GameState.GameState;

var GameDB = require('../client/nodeGame/GameDB.js').GameDB;
var GameBit = require('../client/nodeGame/GameDB.js').GameBit;

var gs = new GameDB();

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

//console.log(gs.toString());

//console.log('Default sort (by Player)');
//gs.sort();
//console.log(gs.toString());
////console.log(gs);
//
//console.log('Reverse');
//gs.reverse();
//console.log(gs.toString());
//
//console.log('Sort by Player');
//gs.sort();
//console.log(gs.toString());
////console.log(gs);
//
//console.log('Sort by State');
//gs.sortByState();
//console.log(gs.toString());
//
//console.log('Sort by Key');
//gs.sortByKey();
//console.log(gs.toString());

//console.log('Get by Player');
//var g = gs.getByPlayer('b');
//console.log(g);

//console.log('Get by State');
//var g = gs.getByState(new GameState({state:2}));
//console.log(g);

//console.log('Get by Key');
//var g = gs.getByKey('z');
//console.log(g);

//console.log('Get Values');
//var v = gs.getValues();
//console.log(v);
//
//console.log('Get Values (reversed)');
//gs.reverse();
//var v = gs.getValues();
//console.log(v);
//
//console.log('Get Value of Player \'a\'');
//var v = gs.getValues({player: 'a'});
//console.log(v);

//console.log('Get Key-Values');
//var v = gs.getKeyValues();
//console.log(v);


//var gs = new GameStorage();
//
//var clients = ['a','b'];//['a','b','c','d'];
//var states = [1,2]; //[1,2,3,4];
//var ids = ['z','x'];//['z','x','c','v'];
//for (var i=0;i<clients.length;i++) {
//	for (var j=0;j<states.length;j++) {
//		for (var x=0;x<ids.length;x++) {
//			var objs = [{mario: 'yes', paolo: 'no', r: Math.random()}]
//			for (var o=0;o<objs.length; o++) {
//				gs.add(clients[i], ids[x], objs[o], new GameState({state:states[j]}));
//			}
//		}
//	}
//}

//console.log(gs.fetch());

//console.log('Default sort (by Player)');
//gs.sort();
//console.log(gs.toString());
////console.log(gs);
//
//console.log('Reverse');
//gs.reverse();
//console.log(gs.toString());

//console.log('Sort by Player');
//gs.sort();
//console.log(gs.toString());
////console.log(gs);
//
//console.log('Sort by State');
//gs.sortByState();
//console.log(gs.toString());
//
//console.log('Sort by Key');
//gs.sortByKey();
//console.log(gs.toString());

//console.log('Get by Player');
//var g = gs.getByPlayer('b');
//console.log(g);
//
//console.log('Get by State');
//var g = gs.getByState(new GameState({state:2}));
//console.log(g);
//
//console.log('Get by Key');
//var g = gs.getByKey('z');
//console.log(g);

//console.log('Get Values');
//var v = gs.getValues();
//console.log(v);

//console.log('Get Values (reversed)');
//gs.reverse();
//var v = gs.getValues();
//console.log(v);
//
//console.log('Get Value of Player \'a\'');
//var v = gs.getValues({player: 'a'});
//console.log(v);

//console.log('Get Key-Values');
//var v = gs.getKeyValues();
//console.log(v);

//console.log('Sort by Key-Values');
//gs.sortByValue('r');
//
//for (var gb in gs.storage) {
//	if (gs.storage.hasOwnProperty(gb)) {
//		console.log(gs.storage[gb].value);
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


//var set = gs.split();
//console.log(set);
//console.log(gs.size());

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
//gs = gs.select('value.r > 0.5');
//
//var out = gs.join('x','z','ahah');
//console.log(out);
//
//console.log('1111111111111111111111');
//var out = out.fetchArray();
//console.log(out);


//console.log('GroupBy Test');
//
//
//
//var out = gs.groupBy('value');
//console.log(out[0].fetch());
//console.log(out);
//console.log(out.length);


	
var storage = [ {state: new GameState({state:1}), player: 10, key: 'SUB', value: 'A'},
                {state: new GameState({state:2}), player: 20, key: 'SUB', value: 'B'},
                {state: new GameState({state:3}), player: 30, key: 'SUB', value: 'B'},
                {state: new GameState({state:4}), player: 40, key: 'SUB', value: 'B'},
                {state: new GameState({state:5}), player: 10, key: 'EVA', value: {'for': 20, eva: 6}},
                {state: new GameState({state:6}), player: 10, key: 'EVA', value: {'for': 30, eva: 9}},
                {state: new GameState({state:1}), player: 10, key: 'EVA', value: {'for': 40, eva: 5}},
                {state: new GameState({state:2}), player: 20, key: 'EVA', value: {'for': 10, eva: 5}},
                {state: new GameState({state:3}), player: 20, key: 'EVA', value: {'for': 30, eva: 8}},
                {state: new GameState({state:4}), player: 20, key: 'EVA', value: {'for': 40, eva: 2}},
                {state: new GameState({state:5}), player: 30, key: 'EVA', value: {'for': 10, eva: 8}},
                {state: new GameState({state:6}), player: 30, key: 'EVA', value: {'for': 20, eva: 8}},
                {state: new GameState({state:3}), player: 30, key: 'EVA', value: {'for': 40, eva: 1}},
                {state: new GameState({state:4}), player: 40, key: 'EVA', value: {'for': 10, eva: 7}},
                {state: new GameState({state:5}), player: 40, key: 'EVA', value: {'for': 20, eva: 9}},
                {state: new GameState({state:3}), player: 40, key: 'EVA', value: {'for': 30, eva: 7}},
                
              ];

var gdb = new GameDB(null,storage);
//
//var out = gs.filter(function(elem){
//		if (elem.player == 40) {
//			//console.log(elem.player);
//			return elem;
//		}
//});


var out = gdb.select('state', '=', new GameState({state:3}));

console.log(out.fetch());
//
//var out = gs.select('player','>', 10);
//console.log(out.fetch());


//var out = gs.join('player', 'value.for')
//			.select('value.SUB')
//			.groupBy('value.SUB');
//
//console.log(out[0].fetch());


//for (var i=0; i<out.length; i++) {
//	var g = out[i];
//	
//	var works = g.groupBy('value.EVA.for');
//	console.log(works.length);
//	for (var j=0; j < works.length; j++) {
//		var work = works[j];
//		console.log(work);
//		var mean = work.mean('value.EVA.eva');
//		console.log(mean);
//	}
//};


//out = Utils.objGetAllKeys(gs.fetch()[0]);
//console.log(out.join(''));


