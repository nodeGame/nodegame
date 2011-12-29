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
var cf = require('../widgets/ChernoffFaces').ChernoffFaces;


var CF = new cf();

console.log(cf);