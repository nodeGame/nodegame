module.exports = configure;

function configure (sio, servernode) {
    sio.enable('browser client etag');
    sio.set('log level', -1);
    return true;
}