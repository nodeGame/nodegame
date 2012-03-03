// Load the smoosh npm packet.
var smoosh = require('smoosh');

// Configurations for file smooshing.
var config = {
    VERSION : "0.0.1",
    
    // Use JSHINT to spot code irregularities.
    JSHINT_OPTS: {
        boss: true,
        forin: true,
        browser: true
    },
    
    JAVASCRIPT: {
        DIST_DIR: "nodegame",
        
        "nodegame": [
        
            // nodegame-window
            "./node_modules/nodegame-window/Canvas.js",
            "./node_modules/nodegame-window/GameWindow.js",
            "./node_modules/nodegame-window/HTMLRenderer.js",
            "./node_modules/nodegame-window/List.js",
            "./node_modules/nodegame-window/Table.js",
            
            // nodegame-widgets
            "./node_modules/nodegame-widgets/ChernoffFaces.js",
            "./node_modules/nodegame-widgets/Controls.js",
            "./node_modules/nodegame-widgets/DataBar.js",
            "./node_modules/nodegame-widgets/DynamicTable.js",
            "./node_modules/nodegame-widgets/EventButton.js",
            "./node_modules/nodegame-widgets/GameBoard.js",
            "./node_modules/nodegame-widgets/GameSummary.js",
            "./node_modules/nodegame-widgets/GameTable.js",
            "./node_modules/nodegame-widgets/MsgBar.js",
            "./node_modules/nodegame-widgets/NDDBBrowser.js",
            "./node_modules/nodegame-widgets/NextPreviousState.js",
            "./node_modules/nodegame-widgets/ServerInfoDisplay.js",
            "./node_modules/nodegame-widgets/StateBar.js",
            "./node_modules/nodegame-widgets/StateDisplay.js",
            "./node_modules/nodegame-widgets/VisualState.js",
            "./node_modules/nodegame-widgets/VisualTimer.js",
            "./node_modules/nodegame-widgets/WaitScreen.js",
            "./node_modules/nodegame-widgets/Wall.js",
            
            // nodegame-client
            "./node_modules/nodegame-server/node_modules/nodegame-client/EventEmitter.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/Game.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/GameDB.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/GameLoop.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/GameMsg.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/GameMsgGenerator.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/GameSocketClient.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/GameState.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/nodeGame.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/PlayerList.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/Utils.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/addons/GameTimer.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/addons/TriggerManager.js",
            
            // JSUS
            "./node_modules/nodegame-server/node_modules/nodegame-client/node_modules/JSUS/jsus.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/node_modules/JSUS/lib/array.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/node_modules/JSUS/lib/dom.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/node_modules/JSUS/lib/eval.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/node_modules/JSUS/lib/obj.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/node_modules/JSUS/lib/random.js",
            "./node_modules/nodegame-server/node_modules/nodegame-client/node_modules/JSUS/lib/time.js",
            
            // NDDB
            "./node_modules/nodegame-server/node_modules/nodegame-client/node_modules/NDDB/nddb.js",
        ],
    }
};

// Smooshing callback chain
// More information on how it behaves can be found in the smoosh Readme https://github.com/fat/smoosh
smoosh
    .config(config) // hand over configurations made above
    .clean() // removes all files out of the nodegame folder
    .run() // runs jshint on full build
    .build() // builds both uncompressed and compressed files
    .analyze(); // analyzes everything