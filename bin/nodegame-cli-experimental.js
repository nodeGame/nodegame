#!/usr/local/bin/node
/**
 * # nodeGame
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Commands for nodegame
 *
 * http://www.nodegame.org
 */

"use strict";

console.log('not ready yet!');
return;

// Modules.
const fs = require('fs-extra');
const path = require('path');

// Load commander.
var program = require('commander');

const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
const spawn = require('child_process').spawn;

const J = require('JSUS').JSUS;


// nodeGame version.
var version = require('./package.json').version;

const ROOT_DIR = __dirname + '/';
const NODE_MODULES_DIR = ROOT_DIR + 'node_modules/';
const NODEGAME_MODULES = [
    'nodegame-server', 'nodegame-client',
    'nodegame-window', 'nodegame-widgets',
    'nodegame-monitor', 'nodegame-game-template',
    'nodegame-requirements', 'nodegame-generator',
    'NDDB', 'JSUS'
];
const N_MODULES = NODEGAME_MODULES.length;

const GAMES_AVAILABLE_DIR = ROOT_DIR + 'games_available/';
const GAMES_ENABLED_DIR = ROOT_DIR + 'games/';


// Helper methods;
const getDirectories = srcPath => {
    return fs.readdirSync(srcPath)
        .filter(file => {
            return fs.statSync(path.join(srcPath, file))
                .isDirectory();
        });
};

const getLinks = srcPath => {
    return fs.readdirSync(srcPath)
        .filter(file => {
            debugger;
            return fs.lstatSync(path.join(srcPath, file))
                .isSymbolicLink();
        });
};

const logList = txt => {
    console.log('  - ' + txt);
};

// START.

program
    .version(version)

program
    .command('checkout [branch]')
    .description('Checkouts desired branch on all nodegame modules')
    .option('-v, --verbose', 'More verbose output')
    .action(function(env, options) {
        let gitCheckout = function(repo, branch, verbose = false) {
            let mydir = NODE_MODULES_DIR + repo;
            let child = execFile(
                'git',
                [ 'checkout', branch ],
                { cwd: mydir },
                (error, stdout, stderr) => {
                    if (error) {
                        logList(repo + ' ' + stderr.trim());
                    }
                    else if (verbose) {
                        logList('module ' + repo + ': ' +
                                stdout.trim());
                    }
                });
        }
        for (let i=-1 ; ++i < N_MODULES ;) {
            let repo = NODEGAME_MODULES[i];
            gitCheckout(repo, env, options.verbose);
        }
    });

program
    .command('list [options]')
    .description('Lists all nodegame modules|games|games_available')
    .action(function(env, options) {
        if (env === "modules") {
            console.log('NodeGame modules: ');
            for (let i=-1 ; ++i < N_MODULES ;) {
                logList(NODEGAME_MODULES[i]);
            }
        }
        else if (env === "games" || env === "games_available") {
            let dir = env === "games" ?
                GAMES_ENABLED_DIR : GAMES_AVAILABLE_DIR;
            let dirs = getDirectories(dir);
            dirs.sort();
            for (let i = 0; i < dirs.length; i++) {
                logList(dirs[i]);
            }
        }
        else {
            console.error(`valid options:
                          modules|games|games_available`);
        }
    });


program
    .command('enable [game]')
    .description('Enables a game by adding a link' +
                 'from games_available')
    .option('-f, --force', 'if link is existings, ' +
            'deletes and recreates it')
    .option('-v, --verbose', 'More verbose output')
    .option('-a, --all', 'Enables all games')
    .action(function(env, options) {
        const enableGame = function(game) {
            debugger
            let source = GAMES_AVAILABLE_DIR + game;
            if (!fs.existsSync(source)) {
                console.error('game not found: ' + game);
                return;
            }
            let destination = GAMES_ENABLED_DIR + game;
            if (fs.existsSync(destination)) {
                if (!options.force) {
                    console.error(`game ${game} already enabled.
                                  use --force`);
                    return;
                }
                fs.removeSync(destination);
            }
            fs.symlink(source, destination, error => {
                if (error) {
                    console.error(`game ${game} could
                                  not be enabled`);
                    throw(error);
                }
                else if (options.verbose) {
                    console.error(`game ${game} enabled`);
                }
            });
        };
        if (options.all) {
            options.force = true;
            let dirs = getDirectories(GAMES_AVAILABLE_DIR);
            for (let i = 0; i < dirs.length; i++) {
                enableGame(dirs[i]);
            }

        }
        else {
            enableGame(env);
        }
    });

program
    .command('disable [game]')
    .description('Disables a game')
    .option('-f, --force', 'removes the game even if not a link')
    .option('-v, --verbose', 'More verbose output')
    .option('-a, --all', 'Disables all games')
    .action(function(env, options) {
        const disableGame = function(game) {
            let destination = GAMES_ENABLED_DIR + game;
            if (!fs.existsSync(destination)) {
                console.warn('game ' + game + ' already disabled');
                return;
            }
            if (!options.force &&
                !fs.lstatSync(destination).isSymbolicLink()) {

                console.warn('game ' + game +
                             ' is not a symbolic link. Use --force');
                return;
            }
            fs.remove(destination, err => {
                if (err) {
                    return console.error(err)
                }
                if (options.verbose) {
                    logList(`game ${game} disabled`)
                }
            });
        };

        if (options.all) {
            if (env) {
                console.error('cannot specify a game ' +
                              'with option --all');
                return;
            }
            let links = getLinks(GAMES_ENABLED_DIR);
            if (!links.length && options.verbose) {
                console.warn('no games to disable found');
                return;
            }
            options.force = true;
            for (let i = 0; i < links.length; i++) {
                disableGame(links[i]);
            }
        }
        else {
            disableGame(env);
        }
    });

//Parsing options
program.parse(process.argv);
