var Utils = require('../client/nodeGame/Utils.js');
module.exports.Utils = Utils.Utils;

var GameState = require('../client/nodeGame/GameState.js');
module.exports.GameState = GameState.GameState;
var GameState = GameState.GameState;

var GameBit = require('../client/nodeGame/GameStorage.js').GameBit;

var NDDB = require('../client/nodeGame/node_modules/NDDB/nddb.js').NDDB;

var log = function (txt, level) {
	console.log (level + ': ' + txt);
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

nddb.clear();
//console.log(nddb.fetch());

var clients = ['a','b'];//['a','b','c','d'];
var states = [1,2]; //[1,2,3,4];
var ids = ['z','x'];//['z','x','c','v'];
for (var i=0;i<clients.length;i++) {
	for (var j=0;j<states.length;j++) {
		for (var x=0;x<ids.length;x++) {
			var objs = [{mario: 'yes', paolo: 'no', r: Math.random()}]
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

//out = nddb.split('value');
//console.log(out.fetch());

//console.log('Group By');
//v = nddb.groupBy('key');
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




