/**
 * # Creates a new game
 * Copyright(c) 2023 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

"use strict";

// Modules.
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const path = require("path");

const J = require("JSUS").JSUS;

module.exports = function (program, vars, utils) {

    const logger = utils.logger;

    const makeLink = utils.makeLinkSync;


    // Add nested commands using `.command()`.
    const game = program.command('game');

    const list = require('./game/list');
    const create = require('./game/create');
    const clone = require('./game/clone');

    list(game, vars, utils);
    create(game, vars, utils);
    clone(game, vars, utils);


    function getRndAdminEndpoint(gameName = '') {
        return gameName + '/' + J.randomString(20, 'aA1');
    }

};
