const execFile = require("child_process").execFile;
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

    return { logger, checkGitExists, getNodeModulesPath };

};
