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
// const readline = require("readline");
const execFile = require("child_process").execFile;
const execFileSync = require("child_process").execFileSync;

const J = require("JSUS").JSUS;
const ngt = require("nodegame-game-template");

module.exports = function (program, vars, utils) {
    const rootDir = vars.rootDir;
    const version = vars.version;
    const NODEGAME_MODULES = vars.NODEGAME_MODULES;
    const NODEGAME_GAMES = vars.NODEGAME_GAMES;
    const isWin = vars.isWin;
    
    const logger = utils.logger;
    
    const NODEGAME_MODULE = "nodegame";
    // const NODEGAME_MODULE = 'nodegame-test';

    const checkGitExists = utils.checkGitExists;

    program
        .command("update")
        .description("Updates nodeGame to the latest version")
        .option('-v, --verbose', 'verbose output')
        .option('-g, --games', 'default games are updated')
        .option('-t, --throws', 'on error, it will throw')
        .action((opts) => {
            checkGitExists(() => update(showRes, opts));
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


    // Update.

    function update(cb, opts) {

        let nodeModulesPath = utils.getNodeModulesPath();
        
        if (nodeModulesPath === false) {
            logger.err('Could not find node_modules dir. Aborting.');
            return;
        }

        const res = {};

        let verbose = opts.verbose;

        let counter = NODEGAME_MODULES.length;
        
        if (verbose) logger.info("Updating all modules./n");

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
        
        let nodeModulesPath = utils.getNodeModulesPath();
        
        if (nodeModulesPath === false) {
            logger.err('Could not find node_modules dir. Aborting.');
            return;
        }

        const branch = opts.branch;

        const res = {};

        let verbose = opts.verbose;
        
        if (verbose) {
            logger.info("Switching to branch " + branch + 
                        " all modules (where available).\n");
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

            let remote = getGitRemote(info);
            let oldBranch = getGitBranch(info);

            info.remote = remote;
            info.branch = opts.branch;

            res[module].remote = remote;
            res[module].branch = oldBranch;
            
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

        let { modulePath, module, opts } = info;

        // if (opts.verbose) logger.info("Getting git remote module: " + module);
        let remote = execFileSync(
            "git",
            [ "remote" ],
            { cwd: modulePath }
        );
        return remote ? String(remote).trim() : false;
    }

    function getGitBranch(info) {                
        let { modulePath, module, opts } = info;
        // if (opts.verbose) logger.info("Getting git branch module: " + module);
        let branch = execFileSync(
            "git",
            [ "branch", "--show-current" ],
            { cwd: modulePath }
        );
        return branch ? String(branch).trim() : false;
    }

    function doGitCheckout(info) {                
        let { modulePath, branch } = info;
        // if (opts.verbose) logger.info("Getting git branch module: " + module);
        try {
            let checkout = execFileSync(
                "git",
                [ "checkout", branch ],
                // Ignore because it is still printing to console.
                { cwd: modulePath, stdio: 'pipe' }
            );
            return checkout ? String(checkout).trim() : false;
        }
        catch(e) {
            return e;
        }
    }

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
