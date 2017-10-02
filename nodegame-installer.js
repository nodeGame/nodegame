#!/usr/local/bin/node
/**
 * # nodeGame Installer
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 *
 * http://www.nodegame.org
 */

"use strict";

// Modules.

const isWin = /^win/.test(process.platform);

const path = require('path');
const fs = require('fs');
const execFile = require('child_process').execFile;
const readline = require('readline');

// nodeGame version.
const VERSION = "v4.0.0";

const NODEGAME_AND_VERSION = 'nodegame-' + VERSION;

const ROOT_DIR = process.cwd()
const NODE_MODULES_DIR = path.resolve(ROOT_DIR, 'node_modules');
const INSTALL_DIR =  path.resolve(ROOT_DIR, NODEGAME_AND_VERSION);

const NODEGAME_MODULES = [
    'nodegame-server', 'nodegame-client',
    'nodegame-window', 'nodegame-widgets',
    'nodegame-monitor', 'nodegame-game-template',
    'nodegame-requirements', 'nodegame-generator',
    'JSUS', 'NDDB'
];
const N_MODULES = NODEGAME_MODULES.length;

const GAMES_AVAILABLE_DIR = path.resolve(INSTALL_DIR,
                                         'games_available');
const GAMES_ENABLED_DIR = path.resolve(INSTALL_DIR, 'games');

const logList = txt => {
    console.log('  - ' + txt);
};

var verbose = false;

// Print cool nodegame logo.

console.log();
console.log('  ***********************************************  ');
console.log('  **    WELCOME TO NODEGAME ' + VERSION + ' INSTALLER   **  ');
console.log('  ***********************************************  ');
console.log();
console.log('  nodeGame is a free and open source javascript');
console.log('  framework for online, multiplayer, real-time ');
console.log('  games and experiments in the browser.');

console.log();
console.log('  creator: Stefano Balietti');
console.log('  website: http://nodegame.org');
console.log('  license: MIT');
console.log('  mail:    info@nodegame.org');
console.log('  twitter: @nodegameorg');
console.log('  forum:   https://groups.google.com/' +
            'forum/?fromgroups#!forum/nodegame');

// Print node and nodeGame version (npm too?).

console.log();
console.log('  ----------------------------------------------');
console.log();

console.log('  node version:      ' + process.version);
console.log('  nodeGame version:  ' + VERSION);
console.log('  install directory: ' + INSTALL_DIR);
console.log();

// Check if nodegame-4.0.0 exists (abort)

if (fs.existsSync(INSTALL_DIR)) {
    console.error('  Error: installation directory already existing.');
    return;
}

// Check if node_modules exists (prompt continue?)

if (fs.existsSync(NODE_MODULES_DIR)) {
    console.error('  Warning: node_modules directory already existing.');
    confirm('  Continue? [y/n] ', function(ok) {
        if (ok) {
            process.stdin.destroy();
            console.log();
            doInstall();
        }
        else {
            console.error('  Installation aborted.');
            console.log();
        }
    });
    return;
}
else {
    doInstall();
}

// Install.

function doInstall() {
    // Create spinner.
    console.log('  Downloading and installing nodeGame packages.');
    let sp = new Spinner('  This might take a few minutes %s  ');
    sp.start();

    let child = execFile(
        isWin ? 'npm.cmd' : 'npm',
        [ 'install', 'nodegame-test' ],
        { cwd: ROOT_DIR },
        (error, stdout, stderr) => {
            if (error) {
                logList(stderr.trim());
            }
            else {
                // Stop spinner.
                sp.stop();

                if (verbose) logList(stdout.trim());
                console.log();
                console.log('  Done! Now some finishing magics...');

                // Move nodegame folder outside node_modules.

                fs.renameSync(path.resolve(NODE_MODULES_DIR,
                                           'nodegame-test'),
                              INSTALL_DIR);

                fs.renameSync(NODE_MODULES_DIR,
                              path.resolve(INSTALL_DIR,
                                           'node_modules'));

                // Move games from node_modules.

                copyGameFromNodeModules('ultimatum-game');

                // Print final Information.

                printFinalInfo();
            }
    });
}

// Helper stuff.
////////////////


function printFinalInfo() {
    console.log();
    console.log('  Installation complete!');
    console.log('  ----------------------------------------------');

    console.log('  Enter the installation directory:');
    console.log('    cd ' + NODEGAME_AND_VERSION);
    console.log();

    console.log('  Start the server:');
    console.log('    node launcher.js');
    console.log();

    console.log('  Open two browser tabs at the address:');
    console.log('    http://localhost:8080/ultimatum');
    console.log();

    console.log('  Open another tab with the monitor interface:');
    console.log('    http://localhost:8080/ultimatum/monitor');
    console.log();

    console.log('  Create a new game:');
    console.log('    bin/nodegame create-game mygame');
    console.log();

    console.log('  Please cite as:');
    console.log('  ----------------------------------------------');
    console.log('    Balietti (2017) "nodeGame: Real-time, synchronous, ');
    console.log('    online experiments in the browser." ' +
                'Behavior Research Methods');
    console.log();
}

function copyGameFromNodeModules(game, enable = true) {
    // Move game from node_modules into  games_available directory.
    fs.renameSync(path.resolve(INSTALL_DIR, 'node_modules', game),
                  path.resolve(GAMES_AVAILABLE_DIR, game));

    if (!enable) return;

    // Enable game.
    fs.symlinkSync(path.resolve(GAMES_AVAILABLE_DIR, game),
                   path.resolve(GAMES_ENABLED_DIR, game),
                   isWin ? 'junction' : 'file');
}

function confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(msg, function (input) {
        rl.close();
        callback(/^y|yes|ok|true$/i.test(input));
    });
}


// Kudos: cli-spinner package.

function Spinner(text) {
    var that;
    that = this;

    this.spinners = [
        "|/-\\",
        "⠂-–—–-",
        "◐◓◑◒",
        "◴◷◶◵",
        "◰◳◲◱",
        "▖▘▝▗",
        "■□▪▫",
        "▌▀▐▄",
        "▉▊▋▌▍▎▏▎▍▌▋▊▉",
        "▁▃▄▅▆▇█▇▆▅▄▃",
        "←↖↑↗→↘↓↙",
        "┤┘┴└├┌┬┐",
        "◢◣◤◥",
        ".oO°Oo.",
        ".oO@*",
        "🌍🌎🌏",
        "◡◡ ⊙⊙ ◠◠",
        "☱☲☴",
        "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏",
        "⠋⠙⠚⠞⠖⠦⠴⠲⠳⠓",
        "⠄⠆⠇⠋⠙⠸⠰⠠⠰⠸⠙⠋⠇⠆",
        "⠋⠙⠚⠒⠂⠂⠒⠲⠴⠦⠖⠒⠐⠐⠒⠓⠋",
        "⠁⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠤⠴⠲⠒⠂⠂⠒⠚⠙⠉⠁",
        "⠈⠉⠋⠓⠒⠐⠐⠒⠖⠦⠤⠠⠠⠤⠦⠖⠒⠐⠐⠒⠓⠋⠉⠈",
        "⠁⠁⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠤⠠⠠⠤⠦⠖⠒⠐⠐⠒⠓⠋⠉⠈⠈",
        "⢄⢂⢁⡁⡈⡐⡠",
        "⢹⢺⢼⣸⣇⡧⡗⡏",
        "⣾⣽⣻⢿⡿⣟⣯⣷",
        "⠁⠂⠄⡀⢀⠠⠐⠈"
    ];

    this.text = text || '';

    this.chars = this.spinners[isWin ? 0 : 4].split('');

    this.delay = 60;

    this.onTick = function(msg) {
        this.clearLine(this.stream);
        this.stream.write(msg);
    };

    this.stream = process.stdout;

    this.enabled = this.stream.isTTY && !process.env.CI;
    
    this.start = function() {
        var current = 0;
        var self = this;
        this.id = setInterval(function() {
            var msg = self.text.indexOf('%s') > -1
                ? self.text.replace('%s', self.chars[current])
                : self.chars[current] + ' ' + self.text;
            self.onTick(msg);

            current = ++current % self.chars.length;
        }, this.delay);
    };

    this.stop = function(clear) {
        clearInterval(this.id);
        this.id = undefined;
        if (clear && this.enabled) this.clearLine(this.stream);
    };

    this.clearLine = function(stream) {
        if (!this.enabled) return;
        readline.clearLine(stream, 0);
        readline.cursorTo(stream, 0);

        // that.stream.clearLine();
        // that.stream.cursorTo(0);
    };
};
