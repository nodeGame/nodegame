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
        // .argument('<action>', 'create or clone')
        .action((action, opts) => {
            
            checkGitExists(() => update(updateEnded, opts));
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
        
        if (opts.verbose) logger.info("Updating all modules.");

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
                            updateResults[module].err = true;
                            if (opts.throw) throw new Error(err);
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

        if (opts.verbose) log("Getting git remote module: " + module);
        let remote = execFileSync(
            "git",
            [ "remote" ],
            { cwd: modulePath }
        );
        return remote ? String(remote).trim() : false;
    }

    function getGitBranch(info) {                
        let { modulePath, module, opts } = info;
        if (opts.verbose) log("Getting git branch module: " + module);
        let branch = execFileSync(
            "git",
            [ "branch", "--show-current" ],
            { cwd: modulePath }
        );
        return branch ? String(branch).trim() : false;
    }

    function updateGitModule(info, cb) {                

        let { modulePath, module, opts, remote, branch } = info;

        if (opts.verbose) log("Pulling git module: " + module);
        let child = execFile(
            "git",
            [ "pull", remote, branch ],
            { cwd: modulePath },
            (error, stdout, stderr) => {


                if (error) {
                    
                console.log(error);
                console.log(stdout);
                console.log(stderr);

                    logger.err('An error occurred.');
                    logger.list("Could not update: " + module);
                    logger.list(stderr.trim());
                    logger.info();
                } 
                else if (opts.verbose) {
                    
                    console.log(stdout);
                    logList(stdout.trim());
                }
                if (cb) cb(error);
            }
        );
    }

    // Utils.

    function updateEnded(res) {
        
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
                table.push(r);
                // if (res[m].err) str += ' Errored!';
                // logger.list(m + ': ' + str);
                
            }
        }

        logger.info();
        logger.info('nodeGame update: ' + totUpdated + ' package/s updated.');
        logger.info();

        if (table.length) console.table(table);
    }
    
};
