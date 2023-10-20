/**
 * # List info about games.
 * Copyright(c) 2023 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

"use strict";

// Modules.
const fs = require("fs-extra");
const path = require("path");

module.exports = function (game, vars, utils) {

    const logger = utils.logger;

    // LIST.
    ////////
    game
        .command('list [remote]')
        .description("List installed games")
        .option("-v, --verbose", "verbose output")
        .allowUnknownOption()
        .action(function(remote, options) {
            let games;

            if (remote) {

                logger.info('List of games available **remotely**.');
                logger.info();

                try {
                    games = require('./cache/remote-games');
                
                    if (!options.verbose) {
                        games.forEach(game => {
                            delete game.wiki;
                            delete game.url;
                            delete game.publication;
                        })
                    }
                }
                catch(e) {
                    logger.err('Could not load list of remote games.')
                }
                
            }
            else {

                logger.info('List of games installed **locally**.');
                logger.info();

                games = [];
                gamesInfoFromDir(vars.gamesDir, games, true, options);
                gamesInfoFromDir(vars.gamesAvailDir, games, false, options);

            }

            games = games.sort((a,b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            });
            
            console.table(games);
        });

    const gamesInfoFromDir = (dir, out, enabled, opts) => {
        let games = fs.readdirSync(dir);

        games.forEach(game => {                 
            let stat = fs.lstatSync(path.join(dir, game));
            if (stat.isDirectory()) {
                let g = { name: game };
                
                g.enabled = enabled || out.indexOf(game) === -1;
                
                if (opts.verbose) {
                    let pkgJSON = path.join(dir, game, 'package.json');
                    if (fs.existsSync(pkgJSON)) {
                        try {
                            pkgJSON = require(pkgJSON);
                            g.descr = pkgJSON.description;
                            g.version = pkgJSON.version;
                            // console.log(pkgJSON);
                        }
                        catch(e) {
                            logger.err('An error occurred while loading ' +
                            'package.json from ' + game);
                        }
                    }
                    else {
                        g.descr = '-';
                    }

                    
                    let dataDir = path.join(dir, game, 'data');
                    if (fs.existsSync(dataDir)) {
                        let rooms = fs.readdirSync(dataDir);
                        rooms = rooms.filter(r => r.indexOf('room' === 0));
                        g.rooms = rooms.length;
                    }
                    else {
                        g.rooms = 0;
                    }

                }

                out.push(g);
            }

        }); 
    };
};