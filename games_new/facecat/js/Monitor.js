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
        game_metadata: {
            name: 'Monitor Screen',
            description: 'No Description',
            version: '0.3'
        },
        game_settings: {
            observer: true
        },
        plot: stager.getState(),
        debug: true,
        verbosity: 100
    };
}
