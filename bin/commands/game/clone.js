/**
 * # Creates a new game
 * Copyright(c) 2023 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

"use strict";

// Modules.
const fs = require("fs-extra");
const path = require("path");

const c = require('ansi-colors');

const J = require("JSUS").JSUS;


module.exports = function (game, vars, utils) {

    const logger = utils.logger;

    const runGit = utils.runGit;
    const runGitSync = utils.runGitSync;

    const makeLink = utils.makeLinkSync;


   
    // CLONE.
    /////////

    game
        .command("clone <game> [new_name] [author] [author_email]")
        .description("Clones an existing game replacing the channel")
        .option("-f, --force", "force on non-empty directory")
        .option("-r, --remote", "clones a remote game")
        .option("--skip-links", "does not copy symbolic links")
        .option("--skip-data", "does not copy the content of the data/ folder")
        .option("--skip-git", "does not copy the .git folder")
        .option("-v, --verbose", "verbose output")
        .allowUnknownOption()
        .action(async function (game, newName, author, email, options) {


            // console.log(game, newName);

            // Checks on folders.
            /////////////////////

            // Do not generate confusion with hidden folders, e.g. .git.
            if (newName.charAt(0) === ".") {
                logger.err("game names cannot start with a dot. " +
                    "Please correct the name and try again."
                    );
                return;
            }
            if (newName.indexOf(" ") !== -1) {
                logger.err("game names cannot contain a dot. " +
                    "Please correct the name and try again."
                    );
                return;
            }

            const clonedGamePath = path.join(vars.dir.gamesAvail, newName);
            const clonedGameLinkPath = path.join(vars.dir.games, newName);

            if (fs.existsSync(clonedGamePath)) {
                let str = "A folder with name " + newName + 
                          " already exists in games_available/";
                
                if (!options.force) {
                    logger.err(str);
                    return;
                }
                logger.warn(str);
            }

            let gameLinkExists = false;
            if (fs.existsSync(clonedGameLinkPath)) {
                let str = "A folder with name " + newName + 
                          " already exists in games/";
                
                if (!options.force) {
                    logger.err(str);
                    return;
                }
                logger.warn(str);

                // Mark it for later, so we do not recreate it.
                gameLinkExists = true;
            }

           
            const gamePath = utils.getGamePath(game);
           
            let conf = { game, newName, gamePath, clonedGamePath, author, email };


            if (!options.remote) {
                if (!gamePath) {
                    logger.err("Could not find game " + game);
                    logger.err("Please check that a folder with such a name " +
                    "exists in games/ or games_available/ and retry.");
                    return;
                }
                
                doClone(conf);
            }
            else {
                

                let remoteGame = utils.getRemoteGamesData(game);

                runGit(
                    [ "clone", remoteGame.url, newName ], 
                    { cwd: vars.dir.gamesAvail }, 
                    (err, vars, utils) => {

                        if (err) {
                            // utils.logger.error("An error occurred downloading " + 
                            //              c.bold(game));
                            console.log(err);
                            return;
                        }
                        console.log('success')
                        // utils.logger.success(c.bold(game) + 
                        //                      " successfully downloaded");
                        
                        console.log(conf);

                        doClone(conf);
                    }
                );
            }

        });

    function doClone(conf) {

        let { game, newName, gamePath, clonedGamePath, author, email } = conf;

        newName = newName.toLowerCase();

        // Check that it is a V8 game.
        //////////////////////////////

        let _channelJSON = path.join(gamePath, 'private', 'channel.json');
        if (!fs.existsSync(_channelJSON)) {
            logger.err("Game " + c.bold(game) + 
                       " does not follow V8 structure, cannot clone.");
            logger.err("Please add a valid private/channel.json file " + 
                       "and retry.");
            return;
        }

        // Copy folder recursively.
        ///////////////////////////

        let copyOpts = {
            createTarget: false,
            skipLinks: options.skipLinks ?? false,
            skipData: options.skipData ?? true,
            skipGit: options.skipGit ?? false,
            verbose: options.verbose ?? false
        };

        // console.log(options);
        // console.log(copyOpts)

        try {
            utils.copyDirRecSync(gamePath, clonedGamePath, copyOpts);
        }
        catch(e) {
            logger.err('An error occurred while copying the files into ' +
                       'the cloned game:');
            logger.info();
            console.log(e);
            return;
        }
                  

        // Replacing files with reference to channel.
        /////////////////////////////////////////////
        
        // package.json
        ///////////////
        
        let [ pkgJSON, oldChannelName ] = 
            clonePkgJSON(gamePath, newName, author, email);

        fs.writeFileSync(
            path.join(clonedGamePath, 'package.json'),
            JSON.stringify(pkgJSON, null, 4)
        );
       
        // private/channel.json
        // channel/channel.settings.js
        //////////////////////////////

        let [ channelJSON, oldPlayerEndpoint ] =
             cloneChannelJSON(gamePath, newName);
        
        // console.log(channelJSON);
        fs.writeFileSync(
            path.join(clonedGamePath, 'private', 'channel.json'),
            JSON.stringify(channelJSON, null, 4)
        );
       
        // public/js/index.js
        /////////////////////
        
        // This file is no longer used in v8, but it is useful as a 
        // template in case users want more control.
        
        let index = cloneIndexJS(gamePath, newName, oldPlayerEndpoint);
        if (index) {
            fs.writeFileSync(
                path.join(clonedGamePath, 'public', 'js', 'index.js'),
                index
            );
        }

        // Make link to games_available/.
        if (!gameLinkExists) makeLink(clonedGamePath, clonedGameLinkPath);

        logger.info("Game cloned, hurray!");
    }

    
    /**
     * ## cloneChannelJSON
     */
    function cloneChannelJSON(gamePath, newChannelName) {
        let channelJSON = path.join(gamePath, 'private', 'channel.json');
        channelJSON = require(channelJSON);
        
        // channelJSON.name = newChannelName;

        let oldPlayerEndpoint = channelJSON.playerEndpoint;
        
        channelJSON.playerEndpoint = newChannelName;
        channelJSON.adminEndpoint = getRndAdminEndpoint(newChannelName);

        // console.log(channelJSON);

        // Check for aliases.
        // //////////////////////
        let channelFile = path.join(gamePath, 'channel', 'channel.settings.js');
        let channel = require(channelFile);

        if (channel.alias) {
            logger.warn('alias found in channel' + os.sep + 
                        'channel.settings.js: please adjust this setting ' +
                        'manually.');
        }

        return [ channelJSON, oldPlayerEndpoint ];
    }
        
    /**
     * ## clonePkgJSON
     */
    function clonePkgJSON(gamePath, newName, author, email) {
        let pkgJSON = path.join(gamePath, 'package.json');
        pkgJSON = require(pkgJSON);
        
        pkgJSON.name = newName;
        
        if (author) pkgJSON.author = { author: author };
        if (email) {
            if (author) pkgJSON.author.email = email;
            else pkgJSON.author = { email: email };
        }  

        // Check if package.json has channelName.
        let oldChannelName;
        if (pkgJSON.channelName) {
            oldChannelName = pkgJSON.channelName;
            pkgJSON.channelName = newName;
        }

        // console.log(pkgJSON);

        return [ pkgJSON, oldChannelName ];
    }

    /**
     * ## cloneIndexJS
     */
    function cloneIndexJS(gamePath, newName, cNameToReplace) {
        let indexPath = path.join(gamePath, 'public', 'js', 'index.js');
        if (!fs.existsSync(indexPath)) return false;

        let index = fs.readFileSync(indexPath, "utf-8");

        let oldConnString1 = 'node.connect("/' + cNameToReplace + '")';
        let oldConnString2 = "node.connect('/" + cNameToReplace + "')";
        let oldConnString3 = 'node.connect(`/' + cNameToReplace + '`)';
        let newConnString = 'node.connect("/' + newName + '")';

        let connStrReplaced;
        // console.log(oldConnString);
        // console.log(newConnString);

        // Replace both connect() and connect('/channel')
        
        if (index.indexOf(oldConnString1) !== -1) {
            index = index.replace(oldConnString1, newConnString);
            connStrReplaced = true;
        }
        if (index.indexOf(oldConnString2) !== -1) {
            index = index.replace(oldConnString2, newConnString);
            connStrReplaced = true;
        }
        if (index.indexOf(oldConnString3) !== -1) {
            index = index.replace(oldConnString3, newConnString);
            connStrReplaced = true;
        }
        
        oldConnString1 = 'node.connect()';
        if (index.indexOf(oldConnString1) !== -1) {
            index = index.replace(oldConnString1, newConnString);
            connStrReplaced = true;
        }
        
        if (!connStrReplaced) {
            logger.warn('Warning! Could not find connect string in ' +
                        'public/index.js. Game may not run correctly.');
            return false;
        }
        
        // console.log(index);

        return index;
    }

    function getRndAdminEndpoint(gameName = '') {
        return gameName + '/' + J.randomString(20, 'aA1');
    }

};
