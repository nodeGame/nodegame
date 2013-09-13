/**
 * This file contains all the building blocks (functions, and configuration)
 * that will be sent to the client.
 */

var Stager = module.parent.exports.Stager;
var stepRules = module.parent.exports.stepRules;

var stager = new Stager();

var game = {};

module.exports = game;

// GLOBALS

game.globals = {};

// INIT and GAMEOVER

stager.setOnInit(function() {
    console.log('** INIT PLAYER! **');
    W.setup('PLAYER');
    this.counter = 0;

    function showFace(data) {
        var faceImg;
        faceImg = W.getElementById('face');
        faceImg.src = this.faces.items[counter++];
    }
    var that = this;
    node.on.data('FACES', function(msg) {
        if (!msg.data) return;
        this.counter = 0;
        this.faces = msg.data;
        this.faces
    });

});

///// STAGES and STEPS

var REPEAT = 10;

var facerank = function() {
    console.log('facerank');
    W.loadFrame('/facerank/html/facepage.htm', function() {
        var next;

        next = W.getElementById("doneButton");
        next.disabled = "";

        next.onclick = function() {
            next.disabled = "disabled";
            node.socket.send(node.msg.create({
                text: 'NEXT',
                data: {
                    mydata: Math.random()
                }
            }));
        };
    });
    return true;
};



stager.addStage({
    id: 'instructions',
    cb: function() {
        console.log('instructions');
        W.loadFrame('/facerank/html/instructions.htm', function() {
            var next;
            next = W.getElementById("doneButton");
            next.onclick = function() {
                this.disabled = "disabled";
                node.emit('DONE');
            };
        });
        
        return true;
    },
    steprule: stepRules.SOLO
});


stager.addStage({
    id: 'facerank',
    cb: facerank,
    steprule: stepRules.SOLO
});

// Now that all the stages have been added,
// we can build the game plot

stager.init()
    .next('instructions')
    .repeat('facerank', REPEAT)
    .gameover();

stager.setOnGameOver(function() {
    // show exit code
});

// We serialize the game sequence before sending it
game.plot = stager.getState();

// Let's add the metadata information

game.metadata = {
    name: 'facerank',
    version: '0.0.2',
    session: 1,
    description: 'no descr'
};


// Other settings, optional

game.settings = {
    publishLevel: 0
};
