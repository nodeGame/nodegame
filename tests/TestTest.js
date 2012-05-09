var JSUS = require('../node_modules/nodegame-server/node_modules/nodegame-client/node_modules/JSUS/jsus.js').JSUS;
module.exports.JSUS = JSUS.JSUS;

GameState.iss = {};

	GameState.iss.UNKNOWN = 0; 		// Game has not been initialized
	GameState.iss.LOADING = 10;		// The game is loading
	GameState.iss.LOADED  = 25;		// Game is loaded, but the GameWindow could still require some time
	GameState.iss.PLAYING = 50;		// Everything is ready
	GameState.iss.DONE = 100;		// The player completed the game state
	
	function GameState (gs) {
		
		// TODO: The check for gs is done many times. Change it.
		if (gs) {
			this.state = 	gs.state;
			this.step = 	gs.step;
			this.round = 	gs.round;
			this.is = 		(gs.is) ? gs.is : GameState.iss.UNKNOWN;
			this.paused = 	(gs.paused) ? gs.paused : false;
		}
		else {
			this.state = 	0;
			this.step = 	0;
			this.round = 	0;
			this.is = 		GameState.iss.UNKNOWN;
			this.paused = 	false;
		}
	}
	
	GameState.prototype.toString = function () {
		var out = '(' + this.round + ') ' + this.state + '.' + this.step + '_' + this.is;
		
		if (this.paused) {
			out += ' (P)';
		}
		return out;
	};
	
	GameState.prototype.todfd = function () {
		var out = '(' + this.round + ') ' + this.state + '.' + this.step + '_' + this.is;
		
		if (this.paused) {
			out += ' (P)';
		}
		return out;
	};
	
	// Compares two GameStates. 
	// If they are equal returns 0,
	// If gm1 is more ahead returns 1, vicersa -1;
	// If strict is set, also the is property is compared
	GameState.compare = function (gs1, gs2, strict) {
		var strict = strict || false;
//		console.log('COMPARAING GSs','DEBUG')
//		console.log(gs1,'DEBUG');
//		console.log(gs2,'DEBUG');
		var result = gs1.state - gs2.state;
		
		if (result === 0 && 'undefined' !== typeof gs1.round) {
			result = gs1.round - gs2.round;
			
			if (result === 0 && 'undefined' !== typeof gs1.step) {
				result = gs1.step - gs2.step;
				
				if (strict && result === 0 && 'undefined' !== typeof gs1.is) {
					result = gs1.is - gs2.is;
				}
			}
		}
//		console.log('EQUAL? ' + result);
		
		return result;
	};
	

	
	
    function obj2Array(obj, keyed, level, cur_level) {
        if ('object' !== typeof obj) return [obj];
        
        if (level) {
            var cur_level = ('undefined' !== typeof cur_level) ? cur_level : 1;
            if (cur_level > level) return [obj];
            cur_level = cur_level + 1;
        }
        
        var result = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if ( 'object' === typeof obj[key] ) {
                    result = result.concat(obj2Array(obj[key], keyed, level, cur_level));
                } else {
                    if (keyed) result.push(key);
                    result.push(obj[key]);
                }
               
            }
        }        
        return result;
    };
    
    function getNestedValue(str, obj) {
        if (!obj) return;
        var keys = str.split('.');
        if (keys.length === 1) {
            return obj[str];
        }
        var k = keys.shift();
        return getNestedValue(keys.join('.'), obj[k]); 
    };
    
	
	var gs = new GameState();
	
//	var container = {a: gs};
	
//	var o = obj2Array(container, true);
//	console.log(o);
	

	
	
	function split(o, key) {        
        
        if ('object' !== typeof o[key]) {
            return JSUS.clone(o);
        }
        
        var out = [];
        var model = JSUS.clone(o);
        model[key] = {};
        
        var splitValue = function (value) {
            for (var i in value) {
                var copy = JSUS.clone(model);
                if (value.hasOwnProperty(i)) {
                    if ('object' === typeof value[i]) {
                        out = out.concat(splitValue(value[i]));
                    }
                    else {
                        copy[key][i] = value[i]; 
                        out.push(copy);
                    }
                }
            }
            return out;
        };
        
        return splitValue(o[key]);
    };
	
	
	var nv = split(gs);
	
	console.log(nv);    
    
	var oo = JSUS.clone(gs);
	
	
	for (var i in oo) {
		if (oo.hasOwnProperty(i)) {
			console.log(oo[i]);
		}
	}
	
	console.log(oo.toString());
	
	console.log(gs.prototype)
	console.log(oo.prototype);
	
	