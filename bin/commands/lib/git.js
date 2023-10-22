
const execFile = require("child_process").execFile;
const execFileSync = require("child_process").execFileSync;

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


const runGit = (params, opts = {}, cb) => {

    if ('string' === typeof opts) {
        opts = { cwd: modulePath };
    }
    else if (!opts.cwd && opts.modulePath) {
        opts.cwd = opts.modulePath;
    }
    // console.log(params)
    // console.log(opts)

    let { modulePath, module, verbose, remote, branch } = info;

    let out = { res: false, err: null };

    // if (opts.verbose) logger.info("Getting git branch module: " + module);
    try {
        let res = execFile(
            "git",
            params,
            opts,
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
    catch(e) {
        out.err = e;
        let err = 'An error occurred while getting current git branch ';
        if (module) err += 'for ' + c.bold(module)
        logger.err(err);
    }

    // console.log(out);
    return out;
};

module.exports = { runGit, runGitSync };