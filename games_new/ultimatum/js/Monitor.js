function Monitor(node) {

    var stager = new node.Stager();

    stager.setOnInit(function() {
        var button;
        var channelList, roomList, clientList;

        // Add refresh button:
        button = document.createElement('button');
        button.innerHTML = 'Refresh';
        button.onclick = function() {
            // Tell widgets to refresh themselves:
            channelList.refresh();
            roomList.refresh();
            clientList.refresh();
        };
        document.body.appendChild(button);

        // Add widgets:
        channelList = node.widgets.append('ChannelList');
        roomList    = node.widgets.append('RoomList');
        clientList  = node.widgets.append('ClientList');
        gameList    = node.widgets.append('GameList');
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
