/**
 * # Creates a new game
 * Copyright(c) 2023 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

"use strict";

// Modules.
const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
const J = require("JSUS").JSUS;

const ServerNode = require("nodegame-server").ServerNode;
// const version = require("./package.json").version;
 
// Split input parameters.
function list(val) {
    return val.split(",");
}

module.exports = function (program) {

    program
    .command('game')
    .description('Handles operation related to games')
    .argument('<action>', 'create or clone')
    .action((action, opts) => {
        if (action === 'create') {
            console.log('CREATING A NEW GAME');
        }
        else if (action === 'clone') {
            console.log('CLONING AN EXISTING GAME');
        }
    })
    .parse()
}