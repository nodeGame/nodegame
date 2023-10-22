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

    const url = {
        git: 'https://git-scm.com/',
        updateModules: 'https://nodegame.org/update/modules.json',
        updateGames: 'https://nodegame.org/update/remote-games.json',
    };

    const dir = {
        root: rootDir,
        nodeModules: path.join(rootDir, 'node_modules'),
        gamesAvail: path.resolve(rootDir, "games_available"),
        games: path.resolve(rootDir, "games"),
        cache: path.resolve(__dirname, "cache")
    };

    const cache = {
        remoteGames: path.join(dir.cache, 'remote-games.json')
    };

    return { 
        NODEGAME_MODULES, NODEGAME_GAMES, version, isWin,
        dir, url, cache
     };

}