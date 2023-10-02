const path = require('path');

module.exports = function(rootDir) {

    const version = require(path.resolve(rootDir, "package.json")).version;

    const isWin = /^win/.test(process.platform);


    const NODEGAME_MODULES = [
        'nodegame-server', 'nodegame-client',
        'nodegame-window', 'nodegame-widgets',
        'nodegame-monitor', 'nodegame-game-template',
        'nodegame-requirements', 
        'nodegame-generator',
        'nodegame-mturk',
        // No need to replace these now.
        // 'nodegame-db', 'nodegame-mondodb',
        'JSUS', 'NDDB'        
    ];

    const NODEGAME_GAMES = [
        'ultimatum-game', 
        'survey-game'
    ];


    return { rootDir, NODEGAME_MODULES, NODEGAME_GAMES, version, isWin };

}