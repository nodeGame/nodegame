const c = require('ansi-colors');

// Indent in msg.
const _ = '  ';

const logger = {
    
    list: txt => {
        console.log('- ' + txt);
    },

    info: txt => {
        if ('undefined' === typeof txt) console.log();
        else console.log(_ + c.cyan(txt));
    },

    err: txt => {
        console.log(_ + c.red('Error: ' + txt));
    },

    warn: txt => {
        console.log(_ + c.yellow('Warning: ' + txt));
    },

    success: txt => {
        console.log(_ + c.green(txt));
    }
};



module.exports = { logger } ;