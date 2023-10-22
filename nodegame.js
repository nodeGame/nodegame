/**
 * # Launcher file for nodeGame Server
 * Copyright(c) 2011-2020 Stefano Balietti
 * MIT Licensed
 *
 * Load configuration options and start the server
 *
 * http://www.nodegame.org
 */

"use strict";

const path = require('path');
// Load commander.
const { Command } = require('commander');
const program = new Command();

const rootDir = __dirname;

const CMD_DIR = path.join(rootDir, 'bin', 'commands');

const vars = require(path.join(CMD_DIR, 'vars.js'))(rootDir);

const utils = require(path.join(CMD_DIR, 'lib', 'utils.js'))(vars);

// Commander.

program
    .name('nodegame')
    .description('nodeGame server for online surveys and experiments')
    .version(vars.version, '-v, --version');


utils.logger.info();

// Start server.
const start = require(path.join(CMD_DIR, 'start.js'));
start(program, vars, utils);

const game = require(path.join(CMD_DIR, 'game.js'));
game(program, vars, utils);

const exportStuff = require(path.join(CMD_DIR, 'export.js'));
exportStuff(program, vars, utils);

const update = require(path.join(CMD_DIR, 'update.js'));
update(program, vars, utils);

program.parse();

    


