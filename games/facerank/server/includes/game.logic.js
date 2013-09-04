var channel = module.parent.exports.channel;
var node = module.parent.exports.node;
var Database = require('nodegame-db').Database;
var ngdb = new Database(node);
var mdb = ngdb.getLayer('MongoDB');

// TODO: this does not work with channel.require ??
//var Stager = module.parent.exports.Stager;
//var stepRules = module.parent.exports.stepRules;

var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;

var stager = new Stager();

var counter = 0;

/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel) {

    //var ff = require('./facefactory.js')


    //The stages / steps of the logic are defined here
    // but could be loaded from the database

    stager.setOnInit(function() {
        // nothing
        console.log('init');
    });

    stager.addStage({
        id: 'facerank',
        cb: function() {
            console.log('********************** facerank stage ' + counter++ + ' **********************');
            

            node.on('in.say.DATA', function(msg) {
                console.log('*************************');
                console.log(node.nodename + ': Received next', msg.data);
                console.log('*************************');
            });

            node.on.data('NEXT', function(msg) {
                console.log('*************************');
                console.log('Received next', msg.data);
                console.log('*************************');
                
//                var face, msg;
//                face = ff.getNextFace();
//                
//                msg = node.msg.create({
//                    text: 'FACE',
//                    data: face.path
//                });
//                
//                node.socket.send(msg, 'ALL');
            });

            node.on('EVA', function(msg) {
                // Saving the evaluation.
                db.store(msg);
            });
            
        }
    });


    stager.init().next('facerank');

    return {
        nodename: 'lgc' + counter,
        game_metadata: {
            name: 'facerank',
            version: '0.0.1'
        },
        game_settings: {
            observer: false
        },
        plot: stager.getState(),
        debug: true,
        verbosity: 100
    };

};