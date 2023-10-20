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

module.exports = { logger } ;