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
const readline = require("readline");
const execFile = require('child_process').execFile;

const J = require("JSUS").JSUS;
const ngt = require("nodegame-game-template");


const NODEGAME_MODULES = [
    'nodegame-server', 'nodegame-client',
    'nodegame-window', 'nodegame-widgets',
    'nodegame-monitor', 'nodegame-game-template',
    'nodegame-requirements', 'nodegame-generator',
    'nodegame-mturk',
    // No need to replace these now.
    // 'nodegame-db', 'nodegame-mondodb',
    'JSUS', 'NDDB',
    'ultimatum-game', 'survey-game'
];

module.exports = function (program, rootDir) {
    const version = require(path.resolve(rootDir, "package.json")).version;

    const isWin = /^win/.test(process.platform);

    
    const NODEGAME_MODULE = "nodegame";
    // const NODEGAME_MODULE = 'nodegame-test';

    program
    .command('update')
        .description('Updates nodeGame to the latest version')
        // .argument('<action>', 'create or clone')
        .action((action, opts) => {
            
        })

};


function checkGitExists(cb) {
    let child = execFile(
        'git',
        [ '--version' ],
        { cwd: ROOT_DIR },
        (error, stdout, stderr) => {
            if (error) {
                err('git not found, cannot install @dev version.');
                log('Install git from: https://git-scm.com/ and retry.');
                installationFailed();
            }
            else {
                if (cb) cb();
            }
        });
}


function getAllGitModules(cb) {
    let gitPrecommitHook = path.resolve(INSTALL_DIR, 'git-hooks', 'pre-commit');
    let counter = NODEGAME_MODULES.length;
    if (verbose) log('Converting modules into git repos.');
    for (let i = 0; i < NODEGAME_MODULES.length; i++) {
        (function(i) {
            var nodeModulesCopy;
            let module = NODEGAME_MODULES[i];
            let modulePath = path.resolve(INSTALL_DIR_MODULES, module);
            let nodeModulesPath = path.resolve(modulePath, 'node_modules');

            // Keep node_modules, if any.
            if (fs.existsSync(nodeModulesPath)) {

                // Remove nodegame modules (if any) will be get by git.
                fs.readdirSync(nodeModulesPath).forEach(function(file, index) {
                    if (inArray(file, NODEGAME_MODULES)) {
                        let modulePath = path.join(nodeModulesPath, file);
                        removeDirRecursiveSync(modulePath);
                    }
                });

                let destDir = doNotMoveInstall ?
                    NODE_MODULES_DIR : INSTALL_DIR_MODULES;
                nodeModulesCopy = path.resolve(destDir,
                                               ('_node_modules-' + module));
                fs.renameSync(nodeModulesPath, nodeModulesCopy);
            }

            // Remove npm folder.
            removeDirRecursiveSync(modulePath);

            setTimeout(function() {
                getGitModule(module, INSTALL_DIR_MODULES, function(err) {
                    if (err) throw new Error(err);
                    // Put back node_modules, if it was copied before.
                    if (nodeModulesCopy) {
                        fs.renameSync(nodeModulesCopy, nodeModulesPath);
                    }
                    // Copy pre-commit hook.
                    fs.copyFileSync(gitPrecommitHook,
                                    path.resolve(modulePath, '.git', 'hooks',
                                                'pre-commit'));
                    counter--;
                    if (counter == 0 && cb) cb();
                });
            }, 100);
        })(i);
    }
}

function getGitModule(module, cwd, cb, noBranch) {
    let repo = doSSH ? 'git@github.com:' : 'https://github.com/';
    repo += 'nodeGame/' + module + '.git';
    if (verbose) log('Cloning git module: ' + module);
    let params = !noBranch && branch ?
        [ 'clone', '-b', branch, repo ] : [ 'clone', repo ];
    let child = execFile(
        'git',
        'pull',
        { cwd: cwd },
        (error, stdout, stderr) => {
            if (error) {
                // If it could not checkout a branch, it could just
                // be that the branch does not exists, so just warning.
                if (!noBranch && branch &&
                    stderr.indexOf('Remote branch') !== -1 &&
                    stderr.indexOf('not found in upstream') !== -1) {

                    error = null;
                    let warnStr = '  Warning! module ' + module +
                        ' branch not found: ' + branch;
                    log(warnStr);
                    warnings = true;
                    getGitModule(module, cwd, cb, true);
                    return;
                }
                else {
                    logList('Could not clone: ' + module);
                    logList(stderr.trim());
                }
                log();
            }
            else if (verbose) {
                logList(stdout.trim());
            }
            if (cb) cb(error);
        });
}


