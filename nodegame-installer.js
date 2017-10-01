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

const path = require('path');
const fs = require('fs');
const execFile = require('child_process').execFile;
const readline = require('readline');

// nodeGame version.
// var version = require('./package.json').version;
var version = "v4.0.0";

const ROOT_DIR = process.cwd() + '/';
const NODE_MODULES_DIR = ROOT_DIR + 'node_modules/';
const INSTALL_DIR =  ROOT_DIR + 'nodegame-' + version;
const NODEGAME_MODULES = [
    'nodegame-server', 'nodegame-client',
    'nodegame-window', 'nodegame-widgets',
    'nodegame-monitor', 'nodegame-game-template',
    'nodegame-requirements', 'nodegame-generator',
    'JSUS', 'NDDB'
];
const N_MODULES = NODEGAME_MODULES.length;

const GAMES_AVAILABLE_DIR = ROOT_DIR + 'games_available/';
const GAMES_ENABLED_DIR = ROOT_DIR + 'games/';

const logList = txt => {
    console.log('  - ' + txt);
};

// Print cool nodegame logo.


console.log();
console.log('  ***********************************************  ');
console.log('  **    WELCOME TO NODEGAME ' + version + ' INSTALLER   **  ');
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
console.log('  forum:   https://groups.google.com/forum/?fromgroups#!forum/nodegame');

// Print node and nodeGame version (npm too?).

console.log();
console.log('  ----------------------------------------------');
console.log();

console.log('  node version:      ' + process.version);
console.log('  nodeGame version:  ' + version);
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

// Install.

function doInstall() {
    // Create spinner.
    console.log('  Downloading and installing nodeGame packages.');
    var sp = new Spinner('  This might take a few minutes %s  ');
    sp.start();
    
    let child = execFile(
        'npm',
        [ 'install', 'nodegame-test' ],
        (error, stdout, stderr) => {
            if (error) {
                logList(stderr.trim());
            }
            else {
                // Stop spinner.
                sp.stop();
                if (verbose) logList(stdout.trim());            
                console.log('\nInstallation complete\n');

                // Move nodegame folder outside node_modules.
                // Move node_modules inside nodegame-vXXX
                // Move games inside games_available directory.
                // Enabled ultimatum.
                // Print final Information.
            }
    });
}

// Helper stuff.
////////////////


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
        "⠁⠂⠄⡀⢀⠠⠐⠈",
        "🌑🌒🌓🌔🌕🌝🌖🌗🌘🌚"
    ];

    this.text = text || '';

    this.chars = this.spinners[4].split('');

    this.delay = 60;

    this.onTick = function(msg) {
        this.clearLine(this.stream);
        this.stream.write(msg);
    };
    
    this.stream = process.stdout;

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
        if (clear) this.clearLine(this.stream);        
    };

    this.clearLine = function(stream) {
        readline.clearLine(stream, 0);
        readline.cursorTo(stream, 0);
    };    
};
