var channel = module.parent.exports.channel;
var node = module.parent.exports.node;
var Database = require('nodegame-db').Database;
var ngdb = new Database(node);
var mdb = ngdb.getLayer('MongoDB');

var Stager = module.parent.exports.Stager;
var stepRules = module.parent.exports.stepRules;
var stager = new Stager();

//var ff = require('./facefactory.js')


var game = {};

module.exports = game;


//The stages / steps of the logic are defined here
// but could be loaded from the database

stager.setOnInit(function() {
    // nothing
});

stager.addStage({
    id: 'facerank',
    cb: function() {
        
        node.on('NEXT', function() {
            var face, msg;
            face = ff.getNextFace();
            
            msg = node.msg.create({
                text: 'FACE',
                data: face.path
            });
            
            node.socket.send(msg, 'ALL');
        });

        node.on('EVA', function(msg) {
            // Saving the evaluation.
            db.store(msg);
        });
        
    }
});