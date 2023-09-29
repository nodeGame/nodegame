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

// nodeGame version.
const version = require('./package.json').version;

const CMD_DIR = path.join(__dirname, 'bin', 'commands');

// Commander.

program
    .name('nodegame')
    .description('nodeGame server for online surveys and experiments')
    .version(version);


// Start server.
const start = require(path.join(CMD_DIR, 'start.js'));
start(program, __dirname);

const game = require(path.join(CMD_DIR, 'game.js'));
game(program, __dirname);

const exportStuff = require(path.join(CMD_DIR, 'export.js'));
exportStuff(program, __dirname);

program.parse();

    


