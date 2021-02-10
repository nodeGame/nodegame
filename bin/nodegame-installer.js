#!/usr/local/bin/node
/**
 * # nodeGame Installer
 * Copyright(c) 2011-2020 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

"use strict";

// Modules.

const isWin = /^win/.test(process.platform);

const path = require('path');
const fs = require('fs');
const execFile = require('child_process').execFile;
const readline = require('readline');

const logList = txt => {
    console.log('  - ' + txt);
};
const log = txt => {
    if ('undefined' === typeof txt) console.log();
    else console.log('  ' + txt);
};
const err = txt => {
    console.error('  Error: ' + txt);
};
const warn = txt => {
    console.error('  Warning: ' + txt);
};

// const MAIN_MODULE = 'nodegame';
const MAIN_MODULE = 'nodegame';

// All stable versions.
// Versions below < 3 are not available.
const STABLE_VERSIONS = {
    v3: '3.5.3',
    v4: '4.3.3',
    v5: '5.11.2',
    v6: '6.2.4'
};

const AVAILABLE_VERSIONS = Object.keys(STABLE_VERSIONS).concat(['dev']);

// Installer default version.
const INSTALLER_VERSION = 'v6';

// If node_modules folders are detected, their paths (without node_modules)
// is stored in here.
var parentNodeModules;

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// The actual version being installed, user can change it.
var version = STABLE_VERSIONS[INSTALLER_VERSION];

// Check if it is a help call.
let p = process.argv[2];
if (p === '--help' || p === '-h') {
    printHelp();
    return;
}
else if (p === '--list-versions') {
    console.log('  List of stable versions:');
    for (let i in STABLE_VERSIONS) {
        if (STABLE_VERSIONS.hasOwnProperty(i)) {
            console.log('   @' + i + ': ' + STABLE_VERSIONS[i]);
        }
    }
    return;
}
else if (p === '--version' || p === '-v') {
    console.log('nodegame-installer ' + version);
    return;
}

var verbose = false;
var nodeModulesExisting = false;
var isDev = false;
var doSSH = false;
var noSpinner = false;
var doNotMoveInstall = false;
var yes;
var noParentDirCheck;
var branch;
var warnings;
var dry;

// User requested version.
var requestedVersion = '@' + version;

for (let i = 0; i < process.argv.length; i++) {
    let option = process.argv[i];

    if (option.charAt(0) === '@') {
        requestedVersion = process.argv[i].substr(1);

        if (requestedVersion === 'dev') {
            isDev = true;
            requestedVersion = '@' + version;

        }
        else {
            version = STABLE_VERSIONS[requestedVersion];
            if (!version) {
                err('invalid version: ', version);
                log('available version options: ' + AVAILABLE_VERSIONS);
                log();
                return;
            }
            requestedVersion = '@' + version;
        }
    }
    else if (option === '--no-spinner') {
        noSpinner = true;
    }
    else if (option === '--yes') {
        yes = true;
    }
    else if (option === '--no-parent-dir-check') {
        noParentDirCheck = true;
    }
    else if (option === '--branch') {
        branch = process.argv[i+1];
        if (!branch) {
            err('--branch option found, but no value provided.');
            log();
            return;
        }

    }
    else if (option === '--ssh') {
        doSSH = true;
    }
    else if (option === '--dry') {
        dry = true;
    }
}

if ((doSSH || branch) && !isDev) {
    err('--branch and --doSSH options are available only with @dev');
    return;
}

// nodeGame version.
const VERSION = isDev ? "v" + version + '-dev' : "v" + version;

const NODEGAME_AND_VERSION = 'nodegame-' + VERSION;

const ROOT_DIR = process.cwd()
const NODE_MODULES_DIR = path.resolve(ROOT_DIR, 'node_modules');

let installDir = process.argv.indexOf('--install-dir');
if (installDir !== -1) {
    installDir = process.argv[installDir+1];
    if (!installDir) {
        err('--install-dir option found, but no value provided.');
        log();
        return;
    }
    installDir = path.join(ROOT_DIR, installDir);
    if (installDir === NODE_MODULES_DIR) doNotMoveInstall = true;
}
else {
    installDir = NODEGAME_AND_VERSION;
}

const INSTALL_DIR = doNotMoveInstall ?
      path.resolve(NODE_MODULES_DIR, MAIN_MODULE) :
      path.resolve(ROOT_DIR, installDir);

const INSTALL_DIR_MODULES = doNotMoveInstall ?
      NODE_MODULES_DIR : path.resolve(INSTALL_DIR, 'node_modules');

const NODEGAME_MODULES = [
    'nodegame-server', 'nodegame-client',
    'nodegame-window', 'nodegame-widgets',
    'nodegame-monitor', 'nodegame-game-template',
    'nodegame-requirements', 'nodegame-generator',
    'nodegame-mturk',
    // No need to replace these now.
    // 'nodegame-db', 'nodegame-mondodb',
    'JSUS', 'NDDB',
    'ultimatum-game'
];
const N_MODULES = NODEGAME_MODULES.length;

const GAMES_AVAILABLE_DIR = path.resolve(INSTALL_DIR,
                                         'games_available');
const GAMES_ENABLED_DIR = path.resolve(INSTALL_DIR, 'games');

// Making sure we do not slip out on an exception.

process.on('uncaughtException', function(err) {
    warn('A generic error occurred during the installation:\n');
    log(err.stack)
    installationFailed();
});

// Printing Info.

// Print cool nodegame logo.
printNodeGameInfo();

// Print node and nodeGame version (npm too?).
printInstallInfo();


// Check node version is.
var nodeVersion = process.versions.node.split('.');
if (parseInt(nodeVersion[0], 10) < 4) {
    err('node version >= 4.x is required.\n' +
        'Please upgrade your Node.Js installation, ' +
        'visit: http://nodejs.org');
    installationAborted();
    return;
}

// Check if install dir exists (abort).
if (fs.existsSync(INSTALL_DIR)) {
    err('installation directory already existing.');
    installationAborted();
    return;
}

// Check if node_modules exists (prompt continue?)
if (fs.existsSync(NODE_MODULES_DIR)) {
    nodeModulesExisting = true;
    warn('A "node_modules" folder was detected in this directory.');
    log();
    log('If you continue, it will become a subfolder of the nodeGame ');
    log('installation. This might affect live node processes, as well as ');
    log('other Node.JS packages relying on this node_modules folder. If ');
    log('unsure, choose No and try to install nodeGame on another path.');
    if (!yes) {
        log();
        confirm('Continue? [y/n]', function(ok) {
            if (ok) {
                log();
                log();
                checkParentNodeModules();
            }
            else {
                installationAborted(true);
                log();
            }
        })
        return;
    }
    else {
        log('Continue? [y/n] --yes');
        log();
    }
}

// Install.
if (isDev) checkGitExists(checkParentNodeModules);
else checkParentNodeModules();


// Helper functions.
///////////////////////////////////////////////////////////////////////////////

function checkParentNodeModules(cb) {
    parentNodeModules = getParentNodeModules();

    // Check if a node_modules folder exists in any folder from the one above.
    // to top /.
    if (!noParentDirCheck && parentNodeModules.length) {
        let str;
        str = 'A "node_modules" folder was detected in ';
        str += parentNodeModules.length === 1 ? 'a parent directory: ' :
            'these parent directories: ';
        warn(str);
        parentNodeModules.forEach(dir => logList(dir));
        log();

        str = 'If you continue, ' + (parentNodeModules.length === 1 ?
                                     'that folder' : 'those folders');
        log(str + ' will be temporarily renamed. This');
        log('might affect only live node processes. If unsure, choose No ');
        log('and try to install nodeGame on another path.');
        log();
        if (!yes) {
            confirm('Continue? [y/n]', renameParentCb);
        }
        else {
            log('Continue? [y/n] --yes');
            log();
            renameParentCb(true);
        }
    }
    else {
        doInstall();
    }
}

function doInstall() {
    var sp;

    // Create spinner.
    log('Downloading and installing nodeGame packages.');

    if (dry) {
        log();
        warn('Dry run: aborting.');
        closeRL(2);
        return;
    }

    if (!noSpinner) {
        sp = new Spinner('  This might take a few minutes %s  ');
        sp.start();
    }
    else {
        log('This might take a few minutes...');
    }

    let child = execFile(
        isWin ? 'npm.cmd' : 'npm',
        [ 'install', MAIN_MODULE + requestedVersion ],
        { cwd: ROOT_DIR },
        (error, stdout, stderr) => {
            // Stop spinner.
            if (!noSpinner) sp.stop();

            if (error) {
                log();
                log();
                log('Oops! The following error/s occurred: ');
                log();
                logList(stderr.trim());
                log();
                installationFailed();
                return;
            }
            else {
                if (verbose) {
                    log();
                    logList(stdout.trim());
                }
                if (!fs.existsSync(path.resolve(NODE_MODULES_DIR))) {
                    log();
                    log();
                    log('Doh! It looks like npm has a different default ' +
                        'installation folder.');
                    log('This can happen if you have a directory called '+
                        '"node_modules" in any of ');
                    log('the parent folders. Please try using a ' +
                        'different path.');
                    installationFailed();
                    return;
                }
                log();
                log('Done! Now some final magic...');
                try {
                    someMagic();
                }
                catch(e) {
                    //                     execFile(
                    //                         'ls',
                    //                         [ '-la'  ],
                    //                         (error, stdout, stderr) => {
                    //                             if (error) {
                    //                                 logList(stderr.trim());
                    //                                 log();
                    //                             }
                    //                             else {
                    //                                 logList(stdout.trim());
                    //                             }
                    //                         });
                    //                     execFile(
                    //                         'ls',
                    //                         [ '../node_modules/', '-la'  ],
                    //                         (error, stdout, stderr) => {
                    //                             if (error) {
                    //                                 logList(stderr.trim());
                    //                                 log();
                    //                             }
                    //                             else {
                    //                                 logList(stdout.trim());
                    //                             }
                    //                         });
                    log('Oops! The following error/s occurred: ');
                    log();
                    console.error(e);
                    installationFailed();
                    return;
                }
            }
            return;
        });
}

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

function printNodeGameInfo() {
    log();
    log('***********************************************  ');
    log('**   WELCOME TO NODEGAME INSTALLER  v' + version +
        '   **  ');
    log('***********************************************  ');
    log();
    log('nodeGame: fast, scalable JavaScript for online, large-scale,');
    log('multiplayer, real-time games and experiments in the browser.');

    log();
    log('creator: Stefano Balietti');
    log('website: https://nodegame.org');
    log('license: MIT');
    log('mail:    info@nodegame.org');
    log('twitter: @nodegameorg');
    log('bugs:    https://github.com/nodeGame/nodegame/issues');
    log('forum:   https://groups.google.com/' +
        'forum/?fromgroups#!forum/nodegame');
}

function printInstallInfo() {
    let str;
    log();
    log('----------------------------------------------');
    log();

    log('node version:      ' + process.version);
    str = 'nodeGame version:  ' + VERSION;
    if (branch) str += ' (' + branch + ')';
    log(str);
    str = 'install directory: ' + INSTALL_DIR;
    if (doNotMoveInstall) str += ' (npm structure)';
    log(str);
    log();
    log();
}

function printFinalInfo() {
    log();
    let str = '  Installation complete!';
    if (warnings) str += ' (with warnings)';
    log(str);
    log('----------------------------------------------');

    log('Enter the installation directory and start the server:');
    if (!doNotMoveInstall) {
        log('  cd ' + NODEGAME_AND_VERSION);
    }
    else {
        log('  cd ' + path.join('node_modules', MAIN_MODULE));
    }
    log('  node launcher.js');
    log();

    log('Open a browser tab at the address:');
    log('  http://localhost:8080/');
    log();

    log('Start a bot from the waiting room interface, or open another tab:');
    log('  http://localhost:8080/ultimatum?clientType=autoplay');
    log();

    log('Check the monitor interface:');
    log('  http://localhost:8080/ultimatum/monitor');
    log();

    log('Create a new game:');
    log('  bin/nodegame create-game mygame');
    log();

    log('Please cite as:');
    log('----------------------------------------------');
    log('  Balietti (2017) "nodeGame: Real-Time, Synchronous, ' +
        'Online Experiments ');
    log('  in the Browser." Behavior Research Methods ' +
        '49(5) pp. 1696–1715');
    log();
}

function closeRL(code) {
    // rl.clearLine();
    rl.close();
    // if (force) process.stdin.destroy();
    process.exit(code);
}

function someMagic(cb) {
    let mainNgDir = path.resolve(NODE_MODULES_DIR, MAIN_MODULE);

    // Check if log and private directories have been created.
    if (!fs.existsSync(path.resolve(mainNgDir, 'log'))) {
        fs.mkdirSync(path.resolve(mainNgDir, 'log'));
    }
    if (!fs.existsSync(path.resolve(mainNgDir, 'private'))) {
        fs.mkdirSync(path.resolve(mainNgDir, 'private'));
    }

    if (!doNotMoveInstall) {
        // Move nodegame folder outside node_modules.
        fs.renameSync(mainNgDir, INSTALL_DIR);

        // Old npms put already all modules under nodegame.
        if (!fs.existsSync(INSTALL_DIR_MODULES)) {
            fs.renameSync(NODE_MODULES_DIR,
                          INSTALL_DIR_MODULES);
        }
        else if (!nodeModulesExisting) {
            fs.rmdirSync(NODE_MODULES_DIR);
        }
    }

    if (isDev) {
        getAllGitModules(function() {
            // Move games from node_modules.
            copyGameFromNodeModules('ultimatum-game');

            // Generator.
            fixGenerator();

            // Restore any parent node_modules folder that was renamed.
            restoreParentNodeModules();

            // Print final Information.
            printFinalInfo();

            closeRL(0);
        });
    }
    else {
        // Move games from node_modules.
        copyGameFromNodeModules('ultimatum-game');

        // Generator.
        fixGenerator();

        // Restore any parent node_modules folder that was renamed.
        restoreParentNodeModules();

        // Print final Information.
        printFinalInfo();

        closeRL(0);
    }
}

function fixGenerator() {
    // nodeGame generator: make link and store conf.
    makeLink(path.resolve(INSTALL_DIR_MODULES,
                          'nodegame-generator',
                          'bin', 'nodegame'),
             path.resolve(INSTALL_DIR, 'bin', 'nodegame'),
	     'file');

    fs.writeFileSync(path.resolve(INSTALL_DIR_MODULES,
				  'nodegame-generator',
				  'conf',
				  'generator.conf.json'),
		     JSON.stringify({
			 author: "",
			 email: "",
			 ngDir: INSTALL_DIR
		     }, 4));
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
                    copyFileSync(gitPrecommitHook,
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
        params,
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

function makeLink(from, to, type) {
    if (isWin) {
        if (type === 'file') fs.linkSync(from, to, 'file');
        else fs.symlinkSync(from, to, 'junction');
    }
    else {
        fs.symlinkSync(from, to);
    }
}

function copyGameFromNodeModules(game, enable) {
    enable = 'undefined' === typeof enable ? true : enable;
    let gameDir = path.resolve(GAMES_AVAILABLE_DIR, game);

    // Move game from node_modules into games_available directory.
    fs.renameSync(path.resolve(INSTALL_DIR_MODULES, game), gameDir);

    // Make sure that the test command works.
    let tmpPath = path.join(gameDir, 'node_modules');
    if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);
    tmpPath = path.join(tmpPath, '.bin');
    if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);
    tmpPath = path.join(tmpPath, 'mocha');
    if (!fs.existsSync(tmpPath)) {
        makeLink(path.join(INSTALL_DIR_MODULES, '.bin/mocha'), tmpPath);
    }

    if (!enable) return;

    // Enable it.
    makeLink(gameDir, path.resolve(GAMES_ENABLED_DIR, game));
}

function confirm(msg, callback, ...params) {
    rl.question('  ' + msg + ' ', function(input) {
        callback(/^y|yes|ok|true$/i.test(input, ...params));
    });
}

function removeDirRecursiveSync(dir) {
    if (dir === '/') {
        throw new Error('   removeDirRecursiveSync error: cannot remove "/"');
    }
    if (dir.indexOf(INSTALL_DIR_MODULES) === -1) {
        err('removeDirRecursiveSync error: there seems to be ' +
            'an error with the path to remove: ');
        console.error(dir);
    }
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(function(file, index){
            let curPath = path.join(dir, file);
            //  Recurse.
            if (fs.lstatSync(curPath).isDirectory()) {
                removeDirRecursiveSync(curPath);
            }
            else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dir);
    }
};

function getParentNodeModules() {
    let tks = ROOT_DIR.split(path.sep);
    let found = [];
    let dirPath = tks[0];
    for (let i = 0 ; i < (tks.length - 1) ; i++) {
        if (i !== 0) dirPath = path.join(dirPath, tks[i]);
        if (fs.existsSync(path.join(dirPath, 'node_modules'))) {
            found.push(dirPath);
        }
    }
    return found;
}

// Need this wrapper because --yes option
function renameParentCb(ok) {
    if (ok) {
        log();
        let res = renameParentNodeModules(parentNodeModules);
        if (res !== true) {
            err('Could not rename "node_modules" folder in: ' + res[0]);
            installationFailed();
        }
        log();
        doInstall();
    }
    else {
        installationAborted(true);
        return;
    }
}

function renameParentNodeModules(parents, restore) {
    let out = [];
    for (let i = 0; i < parents.length; i++) {
        try {
            let f1 = path.join(parents[i], 'node_modules');
            let f2 = f1 + '_backup';
            // Add _bak or remove _bak from parent node_modules folders.
            if (restore) fs.renameSync(f2, f1);
            else fs.renameSync(f1, f2);
        }
        catch(e) {
            out.push(parents[i]);
            // If we are not restoring original folders, exit immediately.
            if (!restore) return(out);
        }
    }
    return true;
}

function restoreParentNodeModules() {
    if (!parentNodeModules || !parentNodeModules.length) return;
    let res = renameParentNodeModules(parentNodeModules, true);
    if (res !== true) {
        log();
        warn('Could not restore parent "node_modules" folder in: ');
        res.forEach(dir => logList(dir));
    }
}

function installationAborted(byUser) {
    let str = 'Installation aborted' + (byUser ? ' by user.' : '.');
    log();
    log(str);
    closeRL(1);
    return;
}

function installationFailed() {
    log();

    log('Installation did not complete successfully.');
    log('----------------------------------------------');
    log();

    log('If you think this might be a bug, please report it. ' +
        'You can either:');
    log('  - open an issue at: ' +
        'https://github.com/nodeGame/nodegame/issues');
    log('  - send an email to info@nodegame.org');
    log();

    // Restore any parent node_modules folder that was renamed.
    restoreParentNodeModules();
    closeRL(1);
}


function printHelp() {
    log();
    log('@<version>              Install a specific version (v3, v4, v5)');
    log('@dev                    Install latest nodeGame from git repos');
    log('    --branch <name>         Checkout this branch on all git repos');
    log('    --ssh                   Use ssh to get all git repos');
    log('--yes                   Answer yes to all questions');
    log('--install-dir <dirname> Set the name of the installation directory;');
    log('                        if equals to node_modules, the npm structure');
    log('                        stays unchanged');
    log('--no-spinner            Does not start the spinner');
    log('--dry                   Does not actually install anything');
    log('--list-versions         Lists stable versions');
    log('--version               Print installer version');
    log('--help                  Print this help');
    log();
}

// Kudos: cli-spinner package.

function Spinner(text) {
    var that;
    that = this;

    this.spinners = [
        "|/-\\",
        "⠂-–—–-",
        "◐◓◑◒",
        "◴◷◶◵",
        "◰◳◲◱",
        "▖▘▝▗",
        "■□▪▫",
        "▌▀▐▄",
        "▉▊▋▌▍▎▏▎▍▌▋▊▉",
        "▁▃▄▅▆▇█▇▆▅▄▃",
        "←↖↑↗→↘↓↙",
        "┤┘┴└├┌┬┐",
        "◢◣◤◥",
        ".oO°Oo.",
        ".oO@*",
        "🌍🌎🌏",
        "◡◡ ⊙⊙ ◠◠",
        "☱☲☴",
        "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏",
        "⠋⠙⠚⠞⠖⠦⠴⠲⠳⠓",
        "⠄⠆⠇⠋⠙⠸⠰⠠⠰⠸⠙⠋⠇⠆",
        "⠋⠙⠚⠒⠂⠂⠒⠲⠴⠦⠖⠒⠐⠐⠒⠓⠋",
        "⠁⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠤⠴⠲⠒⠂⠂⠒⠚⠙⠉⠁",
        "⠈⠉⠋⠓⠒⠐⠐⠒⠖⠦⠤⠠⠠⠤⠦⠖⠒⠐⠐⠒⠓⠋⠉⠈",
        "⠁⠁⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠤⠠⠠⠤⠦⠖⠒⠐⠐⠒⠓⠋⠉⠈⠈",
        "⢄⢂⢁⡁⡈⡐⡠",
        "⢹⢺⢼⣸⣇⡧⡗⡏",
        "⣾⣽⣻⢿⡿⣟⣯⣷",
        "⠁⠂⠄⡀⢀⠠⠐⠈"
    ];

    this.text = text || '';

    this.chars = this.spinners[isWin ? 0 : 4].split('');

    this.delay = 60;

    this.onTick = function(msg) {
        this.clearLine(this.stream);
        this.stream.write(msg);
    };

    this.stream = process.stdout;

    this.start = function() {
        var current = 0;
        var self = this;
        this.id = setInterval(function() {
            var msg = self.text.indexOf('%s') > -1
                ? self.text.replace('%s', self.chars[current])
                : self.chars[current] + ' ' + self.text;
            self.onTick(msg);

            current = ++current % self.chars.length;
        }, this.delay);
    };

    this.stop = function(clear) {
        clearInterval(this.id);
        this.id = undefined;
        if (clear && this.enabled) this.clearLine(this.stream);
    };

    this.clearLine = function(stream) {
        readline.clearLine(stream, 0);
        readline.cursorTo(stream, 0);
    };
};

function inArray(needle, haystack) {
    var func, i, len;
    len = haystack.length;
    for (i = 0; i < len; i++) {
        if (needle === haystack[i]) {
            return needle;
        }
    }
    return false;
}



// Kudos. Adapted from:
// https://github.com/coderaiser/
// fs-copy-file-sync/blob/master/lib/fs-copy-file-sync.js
function _copyFileSync(src, dest, flag) {
    const SIZE = 65536;

    const COPYFILE_EXCL = 1;
    const COPYFILE_FICLONE = 2;
    const COPYFILE_FICLONE_FORCE = 4;

    const constants = {
        COPYFILE_EXCL,
        COPYFILE_FICLONE,
        COPYFILE_FICLONE_FORCE,
    };

    const isNumber = (a) => typeof a === 'number';
    const or = (a, b) => a | b;
    const getValue = (obj) => (key) => obj[key];

    const getMaxMask = (obj) => Object
          .keys(obj)
          .map(getValue(obj))
          .reduce(or);

    const MAX_MASK = getMaxMask(constants);
    const isExcl = (flags) => flags & COPYFILE_EXCL;


    const writeFlag = isExcl(flag) ? 'wx' : 'w';

    const {
        size,
        mode,
    } = fs.statSync(src);

    const fdSrc = fs.openSync(src, 'r');
    const fdDest = fs.openSync(dest, writeFlag, mode);

    const length = size < SIZE ? size : SIZE;

    let pos = 0;
    const peaceSize = size < SIZE ? 0 : size % SIZE;
    const offset = 0;

    let buffer = Buffer.allocUnsafe(length);
    for (let i = 0; length + pos + peaceSize <= size; i++, pos = length * i) {
        fs.readSync(fdSrc, buffer, offset, length, pos);
        fs.writeSync(fdDest, buffer, offset, length, pos);
    }

    if (peaceSize) {
        const length = peaceSize;
        buffer = Buffer.allocUnsafe(length);
        fs.readSync(fdSrc, buffer, offset, length, pos);
        fs.writeSync(fdDest, buffer, offset, length, pos);
    }

    fs.closeSync(fdSrc);
    fs.closeSync(fdDest);
}

function copyFileSync(from, to) {
    if ('function' === typeof fs.copyFileSync) {
        fs.copyFileSync(from, to);
    }
    else {
        _copyFileSync(from, to);
    }
}
