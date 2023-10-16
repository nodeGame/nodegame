const execFile = require("child_process").execFile;
const fs = require('fs');
const path = require('path');

module.exports = function(vars) {
    
    const logger = {
        list: txt => {
            console.log('  - ' + txt);
        },
    
        info: txt => {
            if ('undefined' === typeof txt) console.log();
            else console.log('  ' + txt);
        },
    
        err: txt => {
            console.error('  Error: ' + txt);
        },
    
        warn: txt => {
            console.error('  Warning: ' + txt);
        }
    };
    
        
    const checkGitExists = cb => {
        let child = execFile(
            'git',
            [ '--version' ],
            { cwd: __dirname },
            (error, stdout, stderr) => {
                if (error) {
                    logger.err('git not found, install @dev version ' +
                        'with git and retry.');
                    logger.log('Install git from: ' + vars.gitUrl);
                    // installationFailed();
                }
                else {
                    let v = _extractGitVersion(stdout);
                    if (v.major < 2) {
                        logger.warn('an old version of git was detected, ' +
                        'please consider updating it from: ' + vars.gitUrl);
                    }
                    if (cb) cb(v);
                }
            });
    };

    const _extractGitVersion = gitVersion => {
        let len = "git version ".length;
        let v = gitVersion.substr(len);
        let tkns = v.split('.');
        if (tkns.length < 2) {
            logger.err('An error occurred while parsing git version');
            return {
                major: 0,
                minor: 0,
                patch: 0
            };
        }
        return {
            major: parseInt(tkns[0], 10),
            minor: parseInt(tkns[1], 10),
            patch: parseInt(tkns[2], 10)
        };
    };

    function getNodeModulesPath() {
        return path.resolve(vars.rootDir, "node_modules");
    }

    function getModulePath(module) {
        const nodeModules = getNodeModulesPath();
        let pathToModule = path.join(nodeModules, module);
        if (!fs.existsSync(pathToModule)) return false;
        return pathToModule;
    }

    function getGamePath(game) {
        // Normalize game name.
        game = _extractGameNameFromPath(game);
        console.log('Normalized game: ' + game);
        let pathToGame = path.resolve(vars.rootDir, "games", game);
        if (!fs.existsSync(pathToGame)) {
            pathToGame = path.resolve(vars.rootDir, "games_available", game);
            if (!fs.existsSync(pathToGame)) return false;
        }
        // Check if it is a link in games/
        else if (!fs.lstatSync(pathToGame).isDirectory() ) {
            pathToGame = path.resolve(vars.rootDir, "games_available", game);
            if (!fs.existsSync(pathToGame)) return false;
        }
        return pathToGame;
    }

    /**
     * _extractGameNameFromPath
     * 
     * Check if a path starts with games/ or games_available/ and strips that
     * 
     * @param {string} gamePath The path or game name to check
     * @param {boolean} retry True if it is a second attempt in recursive search 
     * 
     * @returns {string} The name of the game
     * 
     * @api private
     */
    const _extractGameNameFromPath = (gamePath, retry) => {
        let found = false;
        if (retry) sep = '\\'; 
        else sep = '/';

        let g = "games" + sep;
        if (gamePath.indexOf(g) === 0) {
            found = true;
        }
        else {
            g = "./games" + sep;
            if (gamePath.indexOf(g) === 0) {
                found = true;
            }
            else {
                g = "games_available" + sep;
                if (gamePath.indexOf(g) === 0) {
                    found = true;
                }
                else {
                    g = "./games_available" + sep;
                    if (gamePath.indexOf(g) === 0) found = true;    
                }
            }
        }

        if (!found && !retry) {
            found = _extractGameNameFromPath(gamePath, true);
        }
        
        return found ? gamePath.substring(g.length) : gamePath;

    }

    function copyFileSync(source, target) {

        let targetFile = target;
    
        // If target is a directory, a new file with the same name will be created.
        if (fs.existsSync(target)) {
            if (fs.lstatSync(target).isDirectory() ) {
                targetFile = path.join(target, path.basename(source));
            }
        }
    
        fs.writeFileSync(targetFile, fs.readFileSync(source));
    }
    
    function copyDirRecSync(source, target, opts = {}) {
        
        let skipLinks = opts.skipLinks ?? true;
        let skipData  = opts.skipData ?? true;
        let skipGit   = opts.skipGit  ?? true;
        
        let dirName = path.basename(source);     
        
        // Do not clone .git dir unless requested.
        if (skipGit && dirName === '.git') return;
        
        // Check if folder needs to be created or integrated.
        let targetFolder = opts.createTarget !== false ?
            path.join(target, dirName) : target;
        if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);
        
        // Do not clone data/ dir unless requested.
        // (but it is created empty).
        if (skipData && dirName === 'data') return;

        // Copy
        
        // Manual cloning.
        opts = { skipLinks, skipData, skipGit, skipData };
        
        // console.log(opts)
        console.log(source);
    
        let files = [];
        if (fs.lstatSync(source).isDirectory()) {
            files = fs.readdirSync(source);
            files.forEach(file => {
                let curSource = path.join(source, file);
                let stat = fs.lstatSync(curSource);
                if (stat.isDirectory()) {
                    copyDirRecSync(curSource, targetFolder, opts);
                }
                else if (stat.isSymbolicLink()) {
                    if (skipLinks) {
                        makeLinkSync(curSource, path.join(targetFolder, file));
                    }
                    else if (opts.verbose) {
                        console.log('Skipped link: ' + curSource);
                    }
                }
                else {
                    copyFileSync(curSource, targetFolder, opts);
                }
            });
        }
    }

    
    function makeLinkSync(from, to, type) {
        if (vars.isWin) {
            // console.log(from);
            // console.log(to);
            if (type === "file") fs.linkSync(from, to, "file");
            else fs.symlinkSync(from, to, "junction");
        }
        else {
            fs.symlinkSync(from, to);
        }
    }


    return { logger, copyDirRecSync, makeLinkSync,
             checkGitExists, getNodeModulesPath, getGamePath, getModulePath };

};
