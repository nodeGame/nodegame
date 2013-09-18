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
    this.faces = {};
});

///// STAGES and STEPS

var REPEAT = 10;

var facecat = function() {
    console.log('facecat');
    W.loadFrame('/facecat/html/facepage.htm', function() {
        var next, faceImg, td, dlcat, tagTr, inputTag;
        var translate_radio = {
            'radio_hface': 'Human face',
            'radio_nhface': 'Non-human face',
            'radio_abstract': 'Abstract lines',
            'radio_other': 'Any other known object or shape'
        };

        var chosen_cat;
       
        node.on('radio', function(radio) {
            chosen_cat = radio.id;
            console.log('chosen ' + chosen_cat);
            selectedSpan.innerHTML = translate_radio[chosen_cat];
            displayTags();
        });

        node.on('undo_radio', function(radio) {
            console.log('undoing ' + chosen_cat);
            chosen_cat = null;
            selectedSpan.innerHTML = '';
            displayCats();
        });

        function displayTags() {
            td.style.display = 'none';
            tagInput.value = '';
            tagTr.style.display = '';
            next.disabled = false;
            next.innerHTML = 'Next';
        }

        function displayFace() {
            var order;
            imgPath = node.game.faces.items[node.game.counter++].path;
            faceImg.src = '/facecat/faces/' + imgPath;
            console.log(imgPath);
            
            displayCats()
        }
            
        function displayCats() {
            td.style.display = '';

            next.disabled = true;
            next.innerHTML = 'Select a category';
            tagTr.style.display = 'none';
            order = JSUS.sample(0,3);
            JSUS.shuffleNodes(dlcat, order);
        }

        function onNextFaces(faces) {
            var imgPath;
            console.log('******* AAH! received NEXT from server');
            if ('object' !== typeof faces) {
                console.log('**** Weird: wrong faces! ');
                return;
            }
            else {
                console.log(faces);
            }
            node.game.counter = 0;
            node.game.faces = faces;
            
            displayFace();
        }
        
        function askForNext() {
            //next.disabled = true;
            if (!node.game.faces.items || node.game.counter >= node.game.faces.items.length) {
                node.get('NEXT', onNextFaces);
            }
            else {
                displayFace();
            }
        }
        
        // Elements of the page.
        
        // Next button.
        next = W.getElementById("doneButton");
        
        // Img.
        faceImg = W.getElementById('face');
        
        // Categories.
        td = W.getElementById('td_radio');
        dlcat = W.getElementById('dlcat');
        
        // Tags
        selectedSpan = W.getElementById('radio_selected');
        tagTr = W.getElementById('trtags');
        tagInput = W.getElementById('tag');

        // Click!
        next.onclick = askForNext;
        next.click();
    });
    return true;
};

stager.addStage({
    id: 'instructions',
    cb: function() {
        console.log('instructions');
        W.loadFrame('/facecat/html/instructions.htm', function() {
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
    id: 'facecat',
    cb: facecat,
    steprule: stepRules.SOLO
});

// Now that all the stages have been added,
// we can build the game plot

stager.init()
    .next('instructions')
    .repeat('facecat', REPEAT)
    .gameover();

stager.setOnGameOver(function() {
    // show exit code
});

// We serialize the game sequence before sending it
game.plot = stager.getState();

// Let's add the metadata information

game.metadata = {
    name: 'facecat',
    version: '0.0.2',
    session: 1,
    description: 'no descr'
};


// Other settings, optional

game.settings = {
    publishLevel: 0
};
