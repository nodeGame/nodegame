var node = parent.node,
J = JSUS = parent.JSUS,
NDDB = parent.NDDB,
W = parent.W;


document.getElementById("returnButton").onclick = function(){
    node.emit('errors', ['Cannot complete the task']);
};


function testMeGeneral() {
    
    var errors = [];
    
    if ('undefined' === typeof NDDB) {
        errors.push('NDDB not found');
    }
    
    if ('undefined' === typeof JSUS) {
        errors.push('JSUS not found');
    }
    
    if ('undefined' === typeof node.window) {
        errors.push('node.window not found');
    }
    
    if ('undefined' === typeof W) {
        errors.push('W not found');
    }
    
    if ('undefined' === typeof node.widgets) {
        errors.push('node.widgets not found');
    }
    
    if ('undefined' !== typeof NDDB) {
        try {
            var db = new NDDB();
        }
        catch(e) {
            errors.push('An error occurred manipulating the NDDB object: ' + e.message);
        }
    }
    
    return errors;
};

function testScreenRes() {
    var errors = [];
    var root;
    var screenInfo, w, h;

    screenInfo = W.getScreenInfo();
    w = screenInfo.width;
    h = screenInfo.height;

    root = W.getElementById('CFTEST');
    
    if (w < 768 || w < 1024) {
        J.sprintf('%importantYour current resolution is too low: %important %res!wx!h%res.', {
            '%important': {
                className: 'important'
            },
            '%res': {
                className: 'res'
            },
            '!w': w,
            '!h': w
        }, root);
        W.writeln('The game requires a resolution of at least 1024x768 pixels on the screen', root);
        W.writeln('If you can, maximize the window screen and then reload the page. Otherwise click on "I cannot complete the task"', root);
        errors.push('Inappropriate resolution: ' + h + ' ' + h);
    }

    return errors;    
};

function testMyGame() {
    var errors = [];
    // Some tests.
    return errors;
};

var err1 = testMeGeneral();
var err2 = testScreenRes();
var err3 = testMyGame();

if (err1.length || err2.length || err3.length) {
    node.emit('errors', err1.concat(err2, err3));
}

node.on('errors', function(errors) {
    console.log('ERRORS!!!')
    JSUS.each(err1, function(e){
        console.log(e);
    });
    
    JSUS.each(err2, function(e){
        console.log(e);
    });
    
    JSUS.each(err3, function(e){
        console.log(e);
    });
    
    node.set('errors', {
	player: node.player,
	errors: errors
    });
    
    parent.window.location = '/PR4/error.html?id=' + node.player.mtid + 'err1=' + err1.length + '&err2=' + err2.length + '&err3=' + err3.length;
});

};