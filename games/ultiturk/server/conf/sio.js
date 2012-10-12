module.exports = configure;

function configure (sio) {
	
	//console.log('Configuring socket.io...');
	
    sio.enable('browser client etag');
    sio.set('log level', -1);
    
    return true;
}