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
                    logger.log('Install git from: https://git-scm.com/');
                    // installationFailed();
                }
                else {
                    if (cb) cb();
                }
            });
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
        let pathToGame = path.resolve(vars.rootDir, "games", game);
        if (!fs.existsSync(pathToGame)) {
            pathToGame = path.resolve(vars.rootDir, "games_available", game);
            if (!fs.existsSync(pathToGame)) return false;
        }
        return pathToGame;
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
    
    function copyFolderRecursiveSync(source, target, createTarget = true) {
        let files = [];
    
        // Check if folder needs to be created or integrated
        let targetFolder = createTarget ?
            path.join(target, path.basename(source)) : target;
        if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);
    
        // Copy
        if (fs.lstatSync(source).isDirectory()) {
            files = fs.readdirSync(source);
            files.forEach(file => {
                let curSource = path.join(source, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    copyFolderRecursiveSync(curSource, targetFolder);
                }
                else {
                    copyFileSync( curSource, targetFolder );
                }
            });
        }
    }

    return { logger, copyFolderRecursiveSync, 
             checkGitExists, getNodeModulesPath, getGamePath, getModulePath };

};
