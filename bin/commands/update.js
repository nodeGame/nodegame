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
            checkGitExists(() => update(showUpdateRes, opts));
        });

    // Update.

    function update(cb, opts) {

        let nodeModulesPath = utils.getNodeModulesPath();
        if (nodeModulesPath === false) {
            logger.err('Could not find node_modules dir. Aborting.');
            return;
        }

        const updateResults = {};

        let counter = NODEGAME_MODULES.length;
        
        if (opts.verbose) logger.info("Updating all modules./n");

        for (let i = 0; i < NODEGAME_MODULES.length; i++) {
            (function (i) {
                let module = NODEGAME_MODULES[i];
                let modulePath = path.join(nodeModulesPath, module);
                let pkgJSON = path.join(modulePath, 'package.json');
                let moduleVersion = require(pkgJSON).version;

                updateResults[module] = {
                    name: module,
                    from: moduleVersion
                    // path: modulePath
                };

                let info = { modulePath, module, opts };

                let remote = getGitRemote(info);
                let branch = getGitBranch(info);

                info.remote = remote;
                info.branch = branch;

                updateResults[module].remote = remote;
                updateResults[module].branch = branch;

                setTimeout(function () {
                    updateGitModule(info, function (err) {
                        if (err) {
                            if (opts.throw) throw new Error(err);
                            let errMsg = true;
                            if (err.message &&
                                err.message.indexOf('Please commit your cha')) {

                                errMsg = 'local changes' 
                            }
                            updateResults[module]._err = errMsg;
                            
                        }
                        else {
                            // Clear cache.
                            delete require.cache[require.resolve(pkgJSON)]
                            let newModuleVersion = require(pkgJSON).version;
                            if (newModuleVersion !== moduleVersion) {
                                updateResults[module].to = newModuleVersion;
                            }
                        }
                        counter--;
                        if (counter === 0 && cb) cb(updateResults);
                    });
                // This delay needs to be a bit large because otherwise
                // the loaded package version is not updated (but it should!). 
                }, 250);
            })(i);
        }
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

    function showUpdateRes(res) {
        
        let totErrored = 0;
        let totUpdated = 0;
        let table = [];
        for (let m in res) {
            if (res.hasOwnProperty(m)) {
                let r = res[m];
                let from = r.from;
                let to = r.to;
                if (to) {
                    totUpdated++; 
                    r.version = to;
                    delete r.to;
                }
                else {
                    r.version = from;
                    delete r.from;
                }
                if (r._err) {
                    totErrored++;
                    // So that err is last column.
                    r.err = r._err;
                    delete r._err;
                }
                table.push(r);
                // if (res[m].err) str += ' Errored!';
                // logger.list(m + ': ' + str);
                
            }
        }

        logger.info();
        logger.info('nodeGame update:');
        logger.list(totUpdated + ' package/s updated.');
        if (totErrored) logger.list(totErrored + ' package/s errored.');
        logger.info();

        if (table.length) console.table(table);
    }
    
};
