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
const execFile = require("child_process").execFile;
const execFileSync = require("child_process").execFileSync;

const c = require('ansi-colors');

const J = require("JSUS").JSUS;

module.exports = function (program, vars, utils) {
    const rootDir = vars.dir.root;
    const version = vars.version;
    const NODEGAME_MODULES = vars.NODEGAME_MODULES;
    const NODEGAME_GAMES = vars.NODEGAME_GAMES;
    const isWin = vars.isWin;
    
    const logger = utils.logger;
    
    const checkGitExists = utils.checkGitExists;

    program
        .command("update")
        .description("Fetches the latest version of the package list")
        .option('-v, --verbose', 'verbose output')
        .action(async (opts) => {
            
            if ('function' !== typeof fetch) {
                logger.err('fetch not found. Please update to the latest ' +
                           'version of Node.JS to run update.');
                return;
            }

            // let currGames = require(vars.cache.updateGames);
            // let currGamesLastUpdate = currGames.lastUpdate;
            // currGames = indexGamesArray(currGames.games);

            const url = vars.url.updateGames;

            let res, json;

            // See if fetch exists.
            try {
                res = await fetch(url);
            }
            catch(e) {
                logger.err('Could not fetch the list of packages. Check ' +
                           'your internet connection and try again.')
                return;
            }
            
            try {
                json = await res.json();
            }
            catch(e) {
                logger.err('Could not parse the fetched list of packages. ' +
                           'This downloaded file was malformed/corrupted.');
                return;
            }

            fs.writeFileSync(vars.cache.remoteGames, JSON.stringify(json, null, 4));

            logger.info('List of games saved')
        });


    // const compareRemoteGames = (currIndexed, test) => {
    //     test.forEach(g => {
    //         let currGame = currIndexed[g.name];
            
    //     });
    // };

    const indexGamesArray = arr => {
        let out = {};
        arr.forEach(g => {
            out[g.name] = g;
        });
        return out;
    };

    program
        .command("Upgrade")
        .description("Upgrade nodeGame modules and games to the latest version")
        .option('-v, --verbose', 'verbose output')
        .option('-g, --games', 'default games are updated')
        .option('-t, --throws', 'on error, it will throw')
        .action((opts) => {
            checkGitExists(gitVersion => {
                
                if (gitVersion.minor < 22) {
                    logger.err('git version too old (>= 2.22 required). ' +
                               'Please update to ' + 
                               'the latest git version: ' + vars.git.url);
                    return;
                }

                update(showRes, opts)
            });
        });


    program
        .command("branch [branch]")
        .description("Checkouts a different branch of nodeGame")
        .option('-v, --verbose', 'verbose output')
        .option('-g, --games', 'default games are updated')
        .option('-t, --throws', 'on error, it will throw')
        .action((_branch, opts) => {
            opts.branch = _branch;
            checkGitExists(() => branch(showRes, opts));
        });


    // Upgrade.

    function upgrade(cb, opts) {

        const res = {};

        let verbose = opts.verbose;

        let counter = NODEGAME_MODULES.length;
        
        if (verbose) logger.info("Upgrading all modules./n");

        let modules = NODEGAME_MODULES;
        
        let nPackages = NODEGAME_MODULES.length;
        if (opts.games) {
            modules = modules.concat(vars.NODEGAME_GAMES);
        }

        for (let i = 0; i < modules.length; i++) {
            (function (i) {
                let module = modules[i];
                // console.log(module);
                
                let modulePath;
                // From games/ or games_available/.
                if (opts.games && i >= nPackages) {
                    modulePath = utils.getGamePath(module);
                    // console.log(modulePath)
                }
                // From node_modules/.
                else {
                    modulePath = utils.getModulePath(module);
                }
                if (modulePath === false) {
                    
                    if (verbose) {
                        logger.info();
                        logger.err('Could not find ' + module);
                        logger.info();
                    }

                    res[module] = {
                        name: module,
                        err: 'not found'
                        // path: modulePath
                    };

                    return;
                }

                let pkgJSON = path.join(modulePath, 'package.json');
                let moduleVersion = require(pkgJSON).version;

                res[module] = {
                    name: module,
                    version: moduleVersion
                    // path: modulePath
                };

                let info = { modulePath, module, opts };

                let remote = getGitRemote(info);
                let branch = getGitBranch(info);

                info.remote = remote;
                info.branch = branch;

                res[module].remote = remote;
                res[module].branch = branch;

                setTimeout(function () {
                    updateGitModule(info, function (err) {
                        if (err) {
                            if (opts.throw) throw new Error(err);
                            let errMsg = 'error';
                            if (err.message &&
                                err.message.indexOf('Please commit your cha')) {

                                errMsg = 'local changes' 
                            }
                            res[module].err = errMsg;
                            
                        }
                        else {
                            // Clear cache.
                            delete require.cache[require.resolve(pkgJSON)]
                            let newModuleVersion = require(pkgJSON).version;
                            if (newModuleVersion !== moduleVersion) {
                                res[module].previous = moduleVersion
                                res[module].version = newModuleVersion;
                            }
                        }
                        counter--;
                        if (counter === 0 && cb) cb(res);
                    });
                // This delay needs to be a bit large because otherwise
                // the loaded package version is not updated (but it should!). 
                }, 250);
            })(i);
        }
    }
    
    function branch(cb, opts) {
        
        const branch = opts.branch;

        let listOnly = 'undefined' === typeof branch;

        const res = {};

        let verbose = opts.verbose;
        
        if (verbose) {
            if (listOnly) {
                logger.info("Current branch in modules.\n");
            }
            else {
                logger.info("Switching to branch " + branch + 
                        " all modules (where available).\n");
            }
            
        }

        let modules = NODEGAME_MODULES;
        
        let nPackages = NODEGAME_MODULES.length;
        if (opts.games) {
            modules = modules.concat(vars.NODEGAME_GAMES);
        }

        for (let i = 0; i < modules.length; i++) {

            let module = modules[i];
            // console.log(module);
            
            let modulePath;
            // From games/ or games_available/.
            if (opts.games && i >= nPackages) {
                modulePath = utils.getGamePath(module);
                // console.log(modulePath)
            }
            // From node_modules/.
            else {
                modulePath = utils.getModulePath(module);
            }
            if (modulePath === false) {
                
                if (verbose) {
                    logger.info();
                    logger.err('Could not find ' + module);
                    logger.info();
                }

                res[module] = {
                    name: module,
                    err: 'not found'
                    // path: modulePath
                };

                return;
            }

            let pkgJSON = path.join(modulePath, 'package.json');
            let moduleVersion = require(pkgJSON).version;

            res[module] = {
                name: module,
                version: moduleVersion
                // path: modulePath
            };

            
            let info = { modulePath, module, opts, branch };
            
            // console.log(info);

            let remote = getGitRemote(info);
            if (!remote) continue;
            let oldBranch = getGitBranch(info);

            info.remote = remote;
            info.branch = opts.branch;

            res[module].remote = remote;
            res[module].branch = oldBranch;

            // We do not switch branch, just show what it is.
            if (listOnly) continue;
            
            // Already on that branch.
            if (oldBranch === branch) continue;

            let err = doGitCheckout(info);
            
            if (err) {
                // console.log(opts.throw);
                if (opts.throw) throw new Error(err);
                let errMsg = 'error';
                if (err.message) {
                    let m = err.message;
                    if (m.indexOf('did not match any fi') !== -1) {
                        errMsg = 'branch not found'
                    } 
                    else if (m.indexOf('would be overwritten') !== -1) {
                        errMsg = 'commit needed'
                    }   
                }
                res[module].err = errMsg;
            }
            else {
                res[module].branch = branch;
                res[module].previous = oldBranch;
            }
            

        }

        if (cb) cb(res);
            
    }

    function getGitRemote(info) {                

        let { res, err } = runGitSync([ 'remote' ], info);

        // TODO parse error.
        // if (err)

        return res;
    }

    function getGitBranch(info) {            
        let { res, err } = runGitSync([ "branch", "--show-current" ], info);
    
        // TODO parse error.
        // if (err)

        return res;
    }

    // TODO: homogenize return values from git commands.

    function doGitCheckout(info) {                
        let { branch } = info;
        info.stdio = 'ignore'; // pipe.
        let { res, err } = runGitSync([ "checkout", branch ], info);
    
        // TODO parse error.
        // if (err)

        return res;
    }

    const runGitSync = (params, opts = {}) => {

        if ('string' === typeof opts) {
            opts = { cwd: modulePath };
        }
        else if (!opts.cwd && opts.modulePath) {
            opts.cwd = opts.modulePath;
        }
        // console.log(params)
        // console.log(opts)

        let out = { res: false, err: null };

        // if (opts.verbose) logger.info("Getting git branch module: " + module);
        try {
            let res = execFileSync(
                "git",
                params,
                opts
            );
            if (res) out.res = String(res).trim();
        }
        catch(e) {
            out.err = e;
            let err = 'An error occurred while getting current git branch ';
            if (opts.module) err += 'for ' + c.bold(opts.module)
            logger.err(err);
        }

        // console.log(out);
        return out;
    };

    function updateGitModule(info, cb) {                

        let { modulePath, module, opts, remote, branch } = info;

        let verbose = opts.verbose;

        // if (verbose) logger.info("Pulling git module: " + module);

        let child = execFile(
            "git",
            [ "pull", remote, branch ],
            { cwd: modulePath },
            (error, stdout, stderr) => {

                if (verbose) {
                    logger.info();
                    logger.list("Package: " + module);
                
                    if (error) {    
                        logger.err('An error occurred.');
                        logger.info();
                        logger.list(stderr.trim());
                    } 
                    else {
                        logger.list(stdout.trim());
                    }
                    logger.info();
                }
                        
                
                if (cb) cb(error);
            }
        );
    }

    // Utils.

    function showRes(res) {
        
        let totErrored = 0;
        let totUpdated = 0;
        let table = [];
        for (let m in res) {
            if (res.hasOwnProperty(m)) {
                let r = res[m];
                if (r.previous) totUpdated++; 
                if (r.err) totErrored++;
                table.push(r);
            }
        }
        
        logger.info();
        logger.info('nodeGame update:');
        logger.list(totUpdated + ' package/s updated.');
        if (totErrored) logger.list(totErrored + ' package/s errored.');
        logger.info();
        
        if (table.length || totErrored) {
            let tableCols = [ 'name', 'remote', 'branch', 'version' ];
            if (totUpdated) tableCols.push('previous');
            if (totErrored) tableCols.push('err');
            console.table(table, tableCols);
        }
    }
    
};
