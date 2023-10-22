/**
 * # Game/s related commands.
 * Copyright(c) 2023 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

"use strict";

module.exports = function (program, vars, utils) {


    // Add nested commands using `.command()`.
    const game = program.command('game');

    const list = require('./game/list');
    const create = require('./game/create');
    const clone = require('./game/clone');

    list(game, vars, utils);
    create(game, vars, utils);
    clone(game, vars, utils);

};
