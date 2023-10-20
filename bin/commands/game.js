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
const ngt = require("nodegame-game-template");
const { channel } = require("diagnostics_channel");

module.exports = function (program, vars, utils) {

    const logger = utils.logger;

    const makeLink = utils.makeLinkSync;

    const rootDir = vars.rootDir;
    const version = vars.version;
    const isWin = vars.isWin;

    // This file is "copied" and not linked in Windows,
    // therefore we need to be agnostic while loading the root path.
    const root = J.resolveModuleDir("nodegame-generator");
    const confFile = path.resolve(rootDir, "create-game.json");

    const NODEGAME_MODULE = "nodegame";
    // const NODEGAME_MODULE = 'nodegame-test';

    // ReadLine used by some commands.
    let rl;
    
    // Game-creation configuration.

    // Will be overwritten.
    var conf = {
        author: "author",
        email: "email",
        ngDir: undefined,
        ngVersion: undefined,
        ngGamesAvailDir: undefined,
        ngGamesEnabledDir: undefined,
    };

    // Available templates.
    var templates = {
        dictator: "dictator",
    };

    // TODO: make templates actually loading from games_available.
    // var templatesDir = 'TO_BE_DEFINED';

    // Chosen template. Default dictator.
    const DEFAULT_TEMPLATE = "dictator";


    // Add nested commands using `.command()`.
    const game = program.command('game');

    // LIST.
    ////////
    game
        .command('list [remote]')
        .description("List installed games")
        .option("-v, --verbose", "verbose output")
        .allowUnknownOption()
        .action(function(remote, options) {
            let games;

            if (remote) {

                logger.info('List of games available **remotely**.');
                logger.info();

                try {
                    games = require('./lib/remote-games');
                
                    if (!options.verbose) {
                        games.forEach(game => {
                            delete game.wiki;
                            delete game.url;
                            delete game.publication;
                        })
                    }
                }
                catch(e) {
                    logger.err('Could not load list of remote games.')
                }
                
            }
            else {

                logger.info('List of games installed **locally**.');
                logger.info();

                games = [];
                gamesInfoFromDir(vars.gamesDir, games, true, options);
                gamesInfoFromDir(vars.gamesAvailDir, games, false, options);

            }

            games = games.sort((a,b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            });
            
            console.table(games);
        });

    const gamesInfoFromDir = (dir, out, enabled, opts) => {
        let games = fs.readdirSync(dir);

        games.forEach(game => {                 
            let stat = fs.lstatSync(path.join(dir, game));
            if (stat.isDirectory()) {
                let g = { name: game };
                
                g.enabled = enabled || out.indexOf(game) === -1;
                
                if (opts.verbose) {
                    let pkgJSON = path.join(dir, game, 'package.json');
                    if (fs.existsSync(pkgJSON)) {
                        try {
                            pkgJSON = require(pkgJSON);
                            g.descr = pkgJSON.description;
                            g.version = pkgJSON.version;
                            // console.log(pkgJSON);
                        }
                        catch(e) {
                            logger.err('An error occurred while loading ' +
                            'package.json from ' + game);
                        }
                    }
                    else {
                        g.descr = '-';
                    }

                    
                    let dataDir = path.join(dir, game, 'data');
                    if (fs.existsSync(dataDir)) {
                        let rooms = fs.readdirSync(dataDir);
                        rooms = rooms.filter(r => r.indexOf('room' === 0));
                        g.rooms = rooms.length;
                    }
                    else {
                        g.rooms = 0;
                    }

                }

                out.push(g);
            }

        }); 
    };

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

    
    game
        .command("clone <game> [new_name] [author] [author_email]")
        .description("Clones an existing game replacing the channel")
        .option("-f, --force", "force on non-empty directory")
        .option("--skip-links", "does not copy symbolic links")
        .option("--skip-data", "does not copy the content of the data/ folder")
        .option("--skip-git", "does not copy the .git folder")
        .option("-v, --verbose", "verbose output")
        .allowUnknownOption()
        .action(function (game, newName, author, email, options) {

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

            const clonedGamePath = path.join(vars.gamesAvailDir, newName);
            const clonedGameLinkPath = path.join(vars.gamesDir, newName);

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

            newName = newName.toLowerCase();

            const gamePath = utils.getGamePath(game);

            if (!gamePath) {
                logger.err("Could not find game " + game);
                logger.err("Please check that a folder with such a name " +
                           "exists in games/ or games_available/ and retry.");
                return;
            }

            // Check that it is a V8 game.
            //////////////////////////////

            let _channelJSON = path.join(gamePath, 'private', 'channel.json');
            if (!fs.existsSync(_channelJSON)) {
                logger.err("Game does not follow V8 structure, cannot clone.");
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

            console.log(options);
            console.log(copyOpts)

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
        })

    
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

    /**
     * ## detectNodeGameInstallation
     *
     * Try to detect a nodeGame normal installation
     *
     * First looks 2 and then 1 directories above.
     *
     * @return {object|boolean} An object with paths, or FALSE if detection failed.
     */
    function detectNodeGameInstallation() {
        let ngDir = path.resolve(root, "..", "..");
        let ngPkg = {};
        try {
            ngPkg = require(path.resolve(ngDir, "package.json"));
        }
        catch (e) {
            ngDir = path.resolve(root, "..");
        }
        if (!ngPkg) {
            try {
                ngPkg = require(path.resolve(ngDir, "package.json"));
            }
            catch (e) {
                // Nothing.
            }
        }
        if (ngPkg.name === NODEGAME_MODULE) {
            console.log(
                "NodeGame v" + ngPkg.version + " installation detected in: "
            );
            console.log(ngDir);
            console.log("");

            let gameDirs = checkGameDirs(ngDir);
            if (!gameDirs) {
                console.log(
                    "However, folders games and/or games_available " +
                        "could not be found"
                );
            }
            else {
                return {
                    ngVersion: ngPkg.version,
                    ngDir: ngDir + path.sep,
                    ngGamesAvailDir: gameDirs.ngGamesAvailDir,
                    ngGamesEnabledDir: gameDirs.ngGamesEnabledDir,
                };
            }
        }
        return false;
    }

    /**
     * ## checkGameDirs
     *
     * Verifies that games and games_available exist in the given folder
     *
     * @param {string} ngDir The path to the nodegame installation
     *
     * @return {object|boolean} An object with paths, or FALSE if detection failed.
     */
    function checkGameDirs(ngDir) {
        let ngGamesAvail = path.resolve(ngDir, "games_available");
        if (fs.existsSync(ngGamesAvail)) {
            let ngGames = path.resolve(ngDir, "games");
            if (fs.existsSync(ngGames)) {
                return {
                    ngGamesEnabledDir: ngGames + path.sep,
                    ngGamesAvailDir: ngGamesAvail + path.sep,
                };
            }
        }
        return false;
    }

    /**
     * Prompt for confirmation on STDOUT/STDIN
     */
    function confirm(msg, cb) {
        rl.question(msg, function (input) {
            cb(/^y|yes|ok|true$/i.test(input));
        });
    }

    function questionNoBlank(msg, cb) {
        rl.question(msg, function (answer) {
            // console.log('ANSWER WAS: ' + answer);
            if ("undefined" === typeof answer || answer.trim() === "") {
                questionNoBlank(msg, cb);
                // Needed return otherwise it continues.
                return;
            }
            cb(answer);
        });
    }

    /**
     * Create application at the given directory `path`.
     *
     * @param {string} template
     */
    function createGameDir(
        template,
        gameName,
        outDir,
        author,
        authorEmail,
        options
    ) {
        // Number of synchronous / asynchronous operations.
        var wait = 10;

        var verbose = !!options.verbose;
        var d = new Date();
        var year = d.getFullYear();
        var nodegameCopyright;
        var str, fullCopyright;

        nodegameCopyright =
            "Copyright(c) " + year + " Stefano Balietti <ste@nodegame.org>";

        // Make full copyright string.
        fullCopyright = "Copyright(c) " + year;
        if (author) fullCopyright += " " + author;
        if (authorEmail) fullCopyright += " <" + authorEmail + ">";

        // Fix trailing slash.
        if (outDir.charAt(outDir.length) !== path.sep)
            outDir = outDir += path.sep;

        console.log();
        colorWrite("Creating Game", true);

        function write(filePath, str) {
            fs.writeFileSync(filePath, str);
            if (verbose) colorWrite("   create : " + filePath);
        }

        function substituteHeader(str) {
            // Backward compatible.
            str = str.replace("{AUTHOR}", author);
            str = str.replace("{AUTHOR_EMAIL}", authorEmail);
            str = str.replace("{YEAR}", year);
            // For all games.
            str = str.replace(nodegameCopyright, fullCopyright);
            return str;
        }

        function mkdir(dir, fn) {
            mkdirp(dir, function (err) {
                if (err) throw err;
                if (verbose) colorWrite("   create : " + dir);
                if (fn) fn();
            });
        }

        function complete() {
            if (--wait) return;
            let tmp;

            // Enable by making a link in games/, if not there already.
            tmp = path.resolve(conf.ngGamesEnabledDir, gameName);
            if (!fs.existsSync(tmp)) {
                makeLink(path.join("..", "games_available", gameName), tmp);
            }

            if (verbose) console.log();

            colorWrite("Well done! Game created!", true);

            colorWrite("Copyright string:");
            console.log("   " + fullCopyright);
            console.log();

            colorWrite("Template:");
            console.log("   " + template);
            console.log();

            colorWrite("License:");
            console.log("   MIT");
            console.log();

            colorWrite("Game directory:");
            console.log("   " + outDir.substr(0, outDir.length - 1));
            console.log();

            colorWrite("Admin configuration stored in:");
            tmp = "   " + "channel" + path.sep + "channel.credentials.js";
            console.log(tmp);

            console.log();

            rl.close();
        }

        str =
            " - Is the game single-player? [y/N]\n" +
            "   (Hint: single-player: labeling task, survey, etc. " +
            "Default: No) ";

        confirm(str, function (singlePlayer, oneRoom) {
            console.log();
            console.log(
                "   Choice: " + (singlePlayer ? "single" : "multi") + "-player"
            );
            console.log();

            if (singlePlayer) {
                template = "guessing game";
                // Setting always to true for now.
                oneRoom = true;
            }

            str =
                " - Type a secret passphrase or leave blank to generate a " +
                "random one\n" +
                "   (Hint: it is used to sign auth tokens, " +
                "it won't be asked again): ";

            rl.question(str, function (secret) {
                if ("undefined" === typeof secret || secret.trim() === "") {
                    secret = J.randomString(15, "aA_1");
                }

                console.log();
                str = " - Enter the ADMIN username: ";
                questionNoBlank(str, function (admin) {
                    console.log();
                    str = " - Enter the ADMIN password (hidden): ";
                    muteNext();
                    questionNoBlank(str, function (pwd) {
                        muteNext();
                        str = " - Confirm the ADMIN password (hidden): ";
                        console.log();
                        rl.question(str, function (pwd2) {
                            unmute();
                            console.log();

                            if (pwd !== pwd2) {
                                console.log("Error: passwords do not match.");
                                process.exit();
                                return;
                            }

                            // Description.
                            let descr = " A ";
                            if (singlePlayer) descr += "single-player ";
                            descr += "nodeGame game based on a " + template;
                            str = " - Enter a description (Default:" + 
                                  descr + "): ";


                            rl.question(str, function (descr) {
                                descr =
                                    descr ||
                                    "A nodeGame game based on a " + template;
                                console.log();
                                doIt(
                                    secret,
                                    admin,
                                    pwd,
                                    descr,
                                    singlePlayer,
                                    oneRoom
                                );
                            });
                        });
                    });
                });
            });
        });

        function doIt(secret, admin, pwd, descr, singlePlayer, oneRoom) {
            // Loading Templates.
            let filePath;
            let t = template;

            // AUTH.
            filePath = path.join("auth", "auth.js");
            let auth = loadTemplate(t, filePath);
            filePath = path.join("auth", "auth.settings.js");
            let authSettings = loadTemplate(t, filePath);
            filePath = path.join("auth", "auth.codes.js");
            let authCodes = loadTemplate(t, filePath);

            // CHANNEL.

            filePath = path.join("channel", "channel.settings.js");
            let channelSettings = loadTemplate(t, filePath);
            filePath = path.join("channel", "channel.secret.js");
            let channelSecret = loadTemplate(t, filePath);
            filePath = path.join("channel", "channel.credentials.js");
            let channelCredentials = loadTemplate(t, filePath);

            // GAME.

            let gameStages, gameSettings;
            if (singlePlayer) {
                filePath = path.join("game", "game.stages_single.js");
                gameStages = loadTemplate(t, filePath);
                filePath = path.join("game", "game.settings_single.js");
                gameSettings = loadTemplate(t, filePath);
            }
            else {
                filePath = path.join("game", "game.stages.js");
                gameStages = loadTemplate(t, filePath);
                filePath = path.join("game", "game.settings.js");
                gameSettings = loadTemplate(t, filePath);
            }
            filePath = path.join("game", "game.setup.js");
            let gameSetup = loadTemplate(t, filePath);

            // GAME / client_types.

            let typePlayer, typeBot, typeLogic, typeAutoplay;

            if (singlePlayer) {
                filePath = path.join(
                    "game",
                    "client_types",
                    "player_single.js"
                );
                typePlayer = loadTemplate(t, filePath);
                filePath = path.join("game", "client_types", "bot_single.js");
                typeBot = loadTemplate(t, filePath);
                filePath = path.join("game", "client_types", "logic_single.js");
                typeLogic = loadTemplate(t, filePath);
                filePath = path.join(
                    "game",
                    "client_types",
                    "autoplay_single.js"
                );
                typeAutoplay = loadTemplate(t, filePath);
            }
            else {
                filePath = path.join("game", "client_types", "player.js");
                typePlayer = loadTemplate(t, filePath);
                filePath = path.join("game", "client_types", "bot.js");
                typeBot = loadTemplate(t, filePath);
                filePath = path.join("game", "client_types", "logic.js");
                typeLogic = loadTemplate(t, filePath);
                filePath = path.join("game", "client_types", "autoplay.js");
                typeAutoplay = loadTemplate(t, filePath);
            }

            filePath = path.join("game", "client_types", "phantom.js");
            let typePhantom = loadTemplate(t, filePath);

            // PUBLIC.

            filePath = path.join("public", "index.htm");
            let indexPage = loadTemplate(t, filePath);

            let gamePage, instrPage;

            if (singlePlayer) {
                filePath = path.join("public", "game_single.htm");
                gamePage = loadTemplate(t, filePath);

                filePath = path.join("public", "instructions_single.htm");
                instrPage = loadTemplate(t, filePath);
            }
            else {
                filePath = path.join("public", "game.htm");
                gamePage = loadTemplate(t, filePath);

                filePath = path.join("public", "instructions.htm");
                instrPage = loadTemplate(t, filePath);
            }

            // filePath = path.join('public', 'end.htm');
            // let endPage = loadTemplate(t, filePath);
            filePath = path.join("public", "js", "index.js");
            let indexJS = loadTemplate(t, filePath);
            filePath = path.join("public", "css", "style.css");
            let styleCSS = loadTemplate(t, filePath);

            // VIEWS.

            // WAITROOM.
            let waitroomSettings;
            if (singlePlayer) {
                filePath = path.join("waitroom", "waitroom.settings_single.js");
                waitroomSettings = loadTemplate(t, filePath);
            }
            else {
                filePath = path.join("waitroom", "waitroom.settings.js");
                waitroomSettings = loadTemplate(t, filePath);
            }
            filePath = path.join("waitroom", "waitroom.js");
            let waitroom = loadTemplate(t, "waitroom/waitroom.js");

            // REQUIREMENTS.

            filePath = path.join("requirements", "requirements.settings.js");
            let requirementsSettings = loadTemplate(t, filePath);
            filePath = path.join("requirements", "requirements.room.js");
            let requirementsRoom = loadTemplate(t, filePath);
            filePath = path.join("requirements", "requirements.js");
            let requirements = loadTemplate(t, filePath);

            // LEVELS.

            filePath = path.join("levels", "README.md");
            let levelsREADME = loadTemplate(t, filePath);

            // README.

            let rootREADME = loadTemplate(t, "README.template.md");

            // LICENSE.

            let license = loadTemplate(t, "LICENSE.template");

            mkdir(outDir, function () {
                mkdir(path.resolve(outDir, "data"));

                // AUTH.
                mkdir(path.resolve(outDir, "auth"), function () {
                    auth = substituteHeader(auth);
                    authCodes = substituteHeader(authCodes);
                    authSettings = substituteHeader(authSettings);

                    auth = auth.replace("{NAME}", gameName);
                    let filePath = path.resolve(outDir, "auth", "auth.js");
                    write(filePath, auth);
                    filePath = path.resolve(outDir, "auth", "auth.settings.js");
                    write(filePath, authSettings);
                    filePath = path.resolve(
                        outDir,
                        "auth",
                        "auth.codes.js.sample"
                    );
                    write(filePath, authCodes);
                    complete();
                });

                // CHANNEL.
                mkdir(path.resolve(outDir, "channel"), function () {
                    // Settings.
                    channelSettings = substituteHeader(channelSettings);
                    channelSettings = channelSettings.replace(
                        /{NAME}/g,
                        gameName
                    );
                    channelSettings = channelSettings.replace(
                        "{ADMIN}",
                        getRndAdminEndpoint(gameName)
                    );
                    let filePath = path.resolve(
                        outDir,
                        "channel",
                        "channel.settings.js"
                    );
                    write(filePath, channelSettings);

                    // Credentials.
                    channelCredentials = channelCredentials.replace(
                        /{ADMIN}/,
                        admin
                    );
                    channelCredentials = channelCredentials.replace(
                        /{PWD}/,
                        pwd
                    );
                    channelCredentials = substituteHeader(channelCredentials);
                    filePath = path.resolve(
                        outDir,
                        "channel",
                        "channel.credentials.js"
                    );
                    write(filePath, channelCredentials);

                    // Secret.
                    channelSecret = substituteHeader(channelSecret);
                    channelSecret = channelSecret.replace(/{SECRET}/g, secret);
                    filePath = path.resolve(
                        outDir,
                        "channel",
                        "channel.secret.js"
                    );
                    write(filePath, channelSecret);

                    complete();
                });

                // GAME.
                mkdir(path.resolve(outDir, "game"), function () {
                    gameStages = substituteHeader(gameStages);
                    gameSetup = substituteHeader(gameSetup);
                    gameSettings = substituteHeader(gameSettings);

                    let filePath = path.resolve(
                        outDir,
                        "game",
                        "game.stages.js"
                    );
                    write(filePath, gameStages);
                    filePath = path.resolve(outDir, "game", "game.setup.js");
                    write(filePath, gameSetup);
                    filePath = path.resolve(outDir, "game", "game.settings.js");
                    write(filePath, gameSettings);

                    mkdir(
                        path.resolve(outDir, "game", "client_types"),
                        function () {
                            typePlayer = substituteHeader(typePlayer);
                            typeBot = substituteHeader(typeBot);
                            typeAutoplay = substituteHeader(typeAutoplay);
                            typeLogic = substituteHeader(typeLogic);
                            typePhantom = substituteHeader(typePhantom);

                            let ctPath = path.resolve(
                                outDir,
                                "game",
                                "client_types"
                            );

                            let filePath = path.join(ctPath, "autoplay.js");
                            write(filePath, typeAutoplay);
                            filePath = path.join(ctPath, "player.js");
                            write(filePath, typePlayer);
                            filePath = path.join(ctPath, "bot.js");
                            write(filePath, typeBot);
                            filePath = path.join(ctPath, "logic.js");
                            write(filePath, typeLogic);
                            filePath = path.join(ctPath, "phantom.js");
                            write(filePath, typePhantom);
                            complete();
                        }
                    );
                });

                // PUBLIC.
                mkdir(path.resolve(outDir, "public"), function () {
                    indexJS = substituteHeader(indexJS);
                    indexJS = indexJS.replace("{ENDPOINT}", "/" + gameName);
                    // instrPage = instrPage.replace('{NAME}', gameName);

                    let filePath = path.resolve(outDir, "public", "index.htm");
                    write(filePath, indexPage);
                    filePath = path.resolve(
                        outDir,
                        "public",
                        "instructions.htm"
                    );
                    write(filePath, instrPage);
                    filePath = path.resolve(outDir, "public", "game.htm");
                    write(filePath, gamePage);
                    // filePath = path.resolve(outDir, 'public', 'end.htm');
                    // write(filePath, endPage);

                    // Copying favicon over.
                    fs.copySync(
                        ngt.resolve(path.join("public", "favicon.ico")),
                        path.resolve(outDir, "public", "favicon.ico")
                    );

                    fs.copySync(
                        ngt.resolve(path.join("public", "404.htm")),
                        path.resolve(outDir, "public", "404.htm")
                    );

                    mkdir(path.resolve(outDir, "public", "js"), function () {
                        write(
                            path.resolve(outDir, "public", "js", "index.js"),
                            indexJS
                        );

                        mkdir(
                            path.resolve(outDir, "public", "css"),
                            function () {
                                write(
                                    path.resolve(
                                        outDir,
                                        "public",
                                        "css",
                                        "style.css"
                                    ),
                                    styleCSS
                                );
                                complete();
                            }
                        );
                    });
                });

                // VIEWS.
                mkdir(path.resolve(outDir, "views"), function () {
                    mkdir(
                        path.resolve(outDir, "views", "contexts"),
                        function () {
                            // Something.
                            mkdir(
                                path.resolve(outDir, "views", "templates"),

                                function () {
                                    // Something.
                                    complete();
                                }
                            );
                        }
                    );
                });

                // WAITROOM.
                mkdir(path.resolve(outDir, "waitroom"), function () {
                    let value = oneRoom ? "true" : "false";
                    waitroomSettings = waitroomSettings.replace(
                        /{SAME_ROOM_VALUE}/g,
                        value
                    );

                    waitroom = substituteHeader(waitroom);
                    waitroomSettings = substituteHeader(waitroomSettings);

                    let filePath = path.resolve(
                        outDir,
                        "waitroom",
                        "waitroom.js.sample"
                    );
                    write(filePath, waitroom);
                    filePath = path.resolve(
                        outDir,
                        "waitroom",
                        "waitroom.settings.js"
                    );
                    write(filePath, waitroomSettings);

                    complete();
                });

                // REQUIREMENTS.
                mkdir(path.resolve(outDir, "requirements"), function () {
                    requirements = substituteHeader(requirements);
                    requirementsSettings =
                        substituteHeader(requirementsSettings);
                    requirementsRoom = substituteHeader(requirementsRoom);

                    let filePath = path.resolve(
                        outDir,
                        "requirements",
                        "requirements.js.sample"
                    );
                    write(filePath, requirements);
                    filePath = path.resolve(
                        outDir,
                        "requirements",
                        "requirements.settings.js"
                    );
                    write(filePath, requirementsSettings);
                    filePath = path.resolve(
                        outDir,
                        "requirements",
                        "requirements.room.js.sample"
                    );
                    write(filePath, requirementsRoom);

                    complete();
                });

                // LEVELS.
                mkdir(path.resolve(outDir, "levels"), function () {
                    write(
                        path.resolve(outDir, "levels", "README.md"),
                        levelsREADME
                    );
                    complete();
                });

                // PRIVATE
                mkdir(path.resolve(outDir, "private"), () => {
                    fs.copySync(
                        ngt.resolve(path.join("private", ".gitkeep")),
                        path.resolve(outDir, "private", ".gitkeep")
                    );

                    fs.copySync(
                        ngt.resolve(path.join("private", "README.md")),
                        path.resolve(outDir, "private", "README.md")
                    );

                    complete();
                });

                // README.

                rootREADME = rootREADME.replace(/{NAME}/g, gameName);
                rootREADME = rootREADME.replace(/{DESCR}/g, descr);
                rootREADME = rootREADME.replace(/{AUTHOR}/g, author);
                rootREADME = rootREADME.replace(/{EMAIL}/g, authorEmail);
                write(path.resolve(outDir, "README.md"), rootREADME);

                // README.

                license = license.replace(/{AUTHOR}/g, author);
                license = license.replace(/{YEAR}/g, year);
                write(path.resolve(outDir, "LICENSE"), license);

                // Package.json.
                let pkg = {
                    name: gameName,
                    version: "0.0.1",
                    description: descr,
                    author: author + " " + "<" + authorEmail + ">",
                    license: "MIT/X11",
                    homepage: "http://nodegame.org",
                };

                // Write files.

                write(
                    path.resolve(outDir, "package.json"),
                    JSON.stringify(pkg, null, 4)
                );
                write(
                    path.resolve(outDir, ".gitignore"),
                    loadTemplate(t, ".gitignore")
                );
                write(
                    path.resolve(outDir, ".eslintrc.js"),
                    loadTemplate(t, ".eslintrc.js")
                );

                complete();
            });
        }
    }

    // /**
    //  * Copies a file to a destination
    //  *
    //  */
    // function copyTemplate(from, to) {
    //     from = path.join(__dirname, '..', 'templates', from);
    //     write(to, fs.readFileSync(from, 'utf-8'));
    // }

    /**
     * Check if the given directory `path` is empty.
     *
     * @param {String} dir
     * @param {Function} fn
     */
    function emptyDirectory(dir, fn) {
        fs.readdir(dir, function (err, files) {
            if (err && "ENOENT" !== err.code) throw err;
            fn(!files || !files.length);
        });
    }

    /**
     * Determine if launched from cmd.exe
     */
    function launchedFromCmd() {
        return process.platform === "win32" && process.env._ === undefined;
    }

    /**
     * ## loadTemplate
     *
     * Load template file from the templates dir, or fallback to default one.
     *
     * @param {string} template The name of the template, e.g. ultimatum
     * @param {string} file The path to the file inside the template
     *
     * @return {string} The loaded template
     */
    function loadTemplate(template, file) {
        var templatePath;
        // Uncomment when loading templates from templatesDir works.
        //     templatePath = path.join(templatesDir, templates[template], file);
        //     if (!fs.existsSync(templatePath)) {
        //         // Try to use the default one.
        //         templatePath = ngt.resolve(file);
        //         if (!fs.existsSync(templatePath)) {
        //             throw new Error('Cannot find template file: ' + file);
        //         }
        //     }
        templatePath = ngt.resolve(file);
        if (!fs.existsSync(templatePath)) {
            throw new Error("Cannot find template file: " + file);
        }
        return fs.readFileSync(templatePath, "utf-8");
    }

    function templateExists(template) {
        return !!templates[template];
    }

    /**
     * Create game.
     *
     */
    function createGame(options) {
        var author, authorEmail, destinationPath;
        var template, appName, str, opts;

        if (!options.game) {
            console.log("Error: game name missing");
            return;
        }

        if (path.isAbsolute(options.game)) {
            destinationPath = options.game;
        }
        else {
            // Is there a default game folder?
            if (!conf.ngGamesAvailDir) {
                console.log(
                    "Error: no default games folder found. Please " +
                        "provide an absolute path for the game, or set the " +
                        'default games folder with command "update-conf"'
                );
                rl.close();
                return;
            }
            destinationPath = path.resolve(conf.ngGamesAvailDir, options.game);
        }
        // App name.
        appName = path.basename(path.resolve(destinationPath));

        // Author and email as from input or as default ones.
        author = options.author || conf.author;
        authorEmail = options.email || conf.email;

        // These are the options like -f.
        opts = options.options || {};

        if (opts.template) {
            if (!templateExists(opts.template)) {
                console.log("Error: template not found: " + opts.template);
                return;
            }
            template = opts.template;
        }
        else {
            template = DEFAULT_TEMPLATE;
        }
        // Generate game. Check if it is empty.
        emptyDirectory(destinationPath, function (empty) {
            if (empty || opts.force) {
                if (!empty) {
                    console.log(
                        "  --force option: overwriting existing folder."
                    );
                }
                createGameDir(
                    template,
                    appName,
                    destinationPath,
                    author,
                    authorEmail,
                    opts
                );
            }
            else {
                colorWrite("Warning!", true);
                str =
                    destinationPath +
                    " is not empty, do you want to " +
                    "continue? [y/N] ";
                confirm(str, function (ok) {
                    if (ok) {
                        // process.stdin.destroy();
                        createGameDir(
                            template,
                            appName,
                            destinationPath,
                            author,
                            authorEmail,
                            opts
                        );
                    }
                    else {
                        console.error("aborting");
                        process.exit(1);
                    }
                });
            }
        });
    }

    /**
     * Create conf file
     */
    function createConfFile(cb) {
        var str;

        console.log("");
        str = "Path to nodeGame installation folder: ";
        if (!conf.ngDir || !conf.ngGamesAvailDir || !conf.ngGamesEnabledDir) {
            let ngInfo = detectNodeGameInstallation();
            if (ngInfo) J.mixin(conf, ngInfo);
        }
        if (conf.ngDir) str += "[" + conf.ngDir + "] ";

        colorWrite("Please add missing info or press enter to keep default");

        rl.question(str, function (answer) {
            answer = answer || conf.ngDir;

            if (!answer) {
                console.log(
                    "Error: no directory provided and no default found."
                );
                process.exit();
                return;
            }
            if (!path.isAbsolute(answer))
                answer = path.join(process.cwd(), answer);

            if (!fs.existsSync(answer)) {
                console.log("Error: directory not existing: " + answer);
                process.exit();
                // Must return, otherwise jumps to the next question already.
                return;
            }

            // Add trailing slashes.
            if (launchedFromCmd()) {
                if (answer.substring(answer.length - 2) !== "\\") {
                    answer += "\\";
                }
            }
            else {
                if (answer.charAt(answer.length - 1) !== path.sep) {
                    answer += path.sep;
                }
            }

            // Set nodeGame dir.
            conf.ngDir = answer;

            // Add game directories to conf.
            let gameDirs = checkGameDirs(answer);
            if (!gameDirs) {
                console.log(
                    "Err: Folders games and/or games_available " +
                        "could not be found"
                );
                return;
            }
            conf.ngGamesAvailDir = gameDirs.ngGamesAvailDir;
            conf.ngGamesEnabledDir = gameDirs.ngGamesEnabledDir;

            str = "Default author name: ";
            if (conf.author) str += "[" + conf.author + "] ";

            rl.question(str, function (answer) {
                if (answer) conf.author = answer;

                str = "Default author email: ";
                if (conf.email) str += "[" + conf.email + "] ";
                rl.question(str, function (answer) {
                    if (answer) conf.email = answer;

                    showConf(conf);

                    writeConfFile(conf, cb);
                });
            });
        });
    }

    // function loadTemplates() {
    //     let dir = conf.ngGamesAvailDir;
    //
    //     fs.readdirSync(dir).forEach(function(file, index) {
    //         let curPath = path.join(dir, file);
    //         //  Recurse.
    //         if (fs.lstatSync(curPath).isDirectory()) {
    //             var name;
    //             try {
    //                let packageJson = require(path.join(curPath, 'package.json'));
    //                 name = packageJson.name;
    //                 if (name) templates[name] = curPath;
    //             }
    //             catch(e) {
    //                 // Ignore errors for now.
    //             }
    //         }
    //
    //     });
    // }

    function showConf(localConf) {
        localConf = localConf || conf;
        console.log("");
        colorWrite("Configuration: ", true);
        console.log("    Games folder path: ", localConf.ngGamesAvailDir);
        console.log("          Author name: ", localConf.author);
        console.log("         Author email: ", localConf.email);
        console.log("");
        console.log("To change run nodegame update-conf");
        console.log("");
    }

    function writeConfFile(conf, cb) {
        var str;
        str = JSON.stringify(conf, null, 4);
        fs.writeFile(confFile, str, function (err) {
            if (err) {
                console.log("");
                colorWrite("Error!");
                console.log("Could not write " + confFile);
                console.log(err);
                console.log("");
                console.log("Trying to continue...");
                console.log("");
            }

            if (cb) {
                try {
                    cb();
                } 
                catch (e) {
                    console.log(e);
                    colorWrite("An error occurred. Aborted.");
                    process.exit();
                }
            }
        });
    }

    function loadConfFile(cb, force) {
        let res = true;
        // Try to load configuration. If not found start utility to create it.
        try {
            conf = require(confFile);
        }
        catch (e) {
            // console.log(e);
            console.log("");
            colorWrite("Warning!");
            console.log(
                "nodegame-generator conf file not found or not readable"
            );
            createConfFile(cb);
            res = false;
        }

        if (!res) return;

        if (force || !conf.author || !conf.email || !conf.ngDir) {
            if (!force) {
                console.log("Missing or incomple conf. Trying to recover it.");
            }
            createConfFile(cb);
        }
        else {
            try {
                cb();
            } catch (e) {
                console.log(e);
                colorWrite("An error occurred. Aborted.");
                process.exit();
            }
        }
    }

    function colorWrite(str, br) {
        console.log("\x1b[36m" + str + "\x1b[0m");
        if (br) console.log("");
    }

    function getRndAdminEndpoint(gameName = '') {
        return gameName + '/' + J.randomString(20, 'aA1');
    }

};
