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

     // CREATE.
    //////////

    game
        .command("create [name] [author] [email]")
        .description("Creates a new game in the games directory")
        // .option('-t, --template <template>', 'set the template for game')
        .option("-f, --force", "force on non-empty directory")
        .option("-v, --verbose", "verbose output")
        .allowUnknownOption()
        .action(function(name, author, email, options) {
            
            if (!name) {
                console.log("Error: game name is missing.");
                return;
            }
            
            // Do not generate confusion with hidden folders, e.g. .git.
            if (name.charAt(0) === ".") {
                console.log(
                    "Error: game names cannot start with a dot. " +
                    "Please correct the name and try again."
                    );
                return;
            }
            
            rl = utils.readLine();

            loadConfFile(function () {
                createGame({
                    game: name,
                    author: author,
                    email: email,
                    options: options,
                });
                // rl.close in complete();
            });
     });

};