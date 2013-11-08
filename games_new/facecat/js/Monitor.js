function Monitor(node) {
    
    var stager = new node.Stager();
      
    stager.setOnInit(function() {
        console.log('INIT MONITOR!');
	node.window.setup('MONITOR');
    });
    
    stager.addStage({
        id: 'monitoring',
        cb: function() {
            console.log('Monitoring');
        }
    });

    stager.init()
        .loop('monitoring');

    return {
        io: {        
          reconnect: false
        },
        socket: {
    	  type: 'SocketIo'
        },
        events: {
    	  dumpEvents: true
        },
        game_metadata: {
            name: 'Monitor Screen',
            description: 'No Description',
            version: '0.3'
        },
        game_settings: {
            publishLevel: 0
        },
        plot: stager.getState(),
        debug: true,
        verbosity: 100
    };
}
