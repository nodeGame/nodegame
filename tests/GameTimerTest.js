module.exports.node = {on: function(){}};

var GameState = require('../client/nodeGame/GameState.js');
module.exports.GameState = GameState.GameState;
var Utils = require('../client/nodeGame/Utils.js');
module.exports.Utils = Utils.Utils;
var JSUS = require('../client/nodeGame/node_modules/JSUS/jsus.js');
module.exports.JSUS = JSUS.JSUS;


var GameTimer = require('../client/nodeGame/GameTimer.js').GameTimer;

var options = {milliseconds: 3000};
var gt = new GameTimer();

gt.start();