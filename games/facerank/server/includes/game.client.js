/**
 * This file contains all the building blocks (functions, and configuration) that will be sent to the client
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
    console.log('INIT PLAYER!');

    var that = this;
    node.on.data('facerank', function(msg) {
        var leftSrc, rightSrc, data, imgLeft, imgRight;
        data = msg.data;
        leftSrc = msg.data.left;
        rightSrc = msg.data.right;
        imgLeft = document.createElement('img');
        imgLeft.src = leftSrc;
        imgLeft.className = 'face';
        W.getElementById('td_face_left').appendChild(imgLeft);
        imgRight = document.createElement('img');
        imgRight.src = rightSrc;
        imgRight.className = 'face';
        W.getElementById('td_face_right').appendChild(imgRight);
        console.log('created and updated pictures');
    });

 
});

///// STAGES and STEPS

var REPEAT = 10;

var facerank = function() {
    
    // Clear current selections
    // faces
    W.getElementById('td_face_left').innerHTML = '';
    W.getElementById('td_face_right').innerHTML = '';
    // radios
    W.getElementById('td_radio_left').innerHTML = '';
    W.getElementById('td_radio_right').innerHTML = '';
    // tags
    W.getElementById('tag_left').value = '';
    W.getElementById('tag_right').value = '';
    
    console.log('facerank');
};



stager.addStage({
    id: 'instructions',
    cb: function() {
        console.log('instructions');
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
    observer: false
};
