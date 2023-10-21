const c = require('ansi-colors');


const logger = {
    
    list: txt => {
        console.log('  - ' + txt);
    },

    info: txt => {
        if ('undefined' === typeof txt) console.log();
        else console.log(c.cyan('  ' + txt));
    },

    err: txt => {
        console.log(c.red('  Error: ' + txt));
    },

    warn: txt => {
        console.log(c.yellow('  Warning: ' + txt));
    },

    success: txt => {
        console.log(c.green(txt));
    }
};



module.exports = { logger } ;