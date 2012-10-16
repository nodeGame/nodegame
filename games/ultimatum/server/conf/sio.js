module.exports = configure;

function configure (sio) {	
	// Special configuration for Socket.io goes here
	// See https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
	
    sio.enable('browser client etag');
    sio.set('log level', -1);   
    return true;
}