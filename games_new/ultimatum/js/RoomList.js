/**
 * # RoomList widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Shows current, previous and next state.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('RoomList', RoomList);

    var JSUS = node.JSUS,
        Table = node.window.Table;

    // ## Defaults

    RoomList.defaults = {};
    RoomList.defaults.id = 'roomlist';
    RoomList.defaults.fieldset = {
        legend: 'Rooms',
        id: 'roomlist_fieldset'
    };

    // ## Meta-data

    RoomList.version = '0.1.0';
    RoomList.description = 'Visually display all rooms in a channel.';

    // ## Dependencies

    RoomList.dependencies = {
        JSUS: {},
        Table: {}
    };

    function renderCell(o) {
        var content;
        var text, textElem;

        content = o.content;
        textElem = document.createElement('span');
        if ('object' === typeof content) {
            switch (o.x) {
            case 0:
                text = content.name;
                break;

            case 1:
                text = content.id;
                break;

            case 2:
                text = '' + content.nClients;
                break;
            
            case 3:
                text = '' + content.nPlayers;
                break;
            
            case 4:
                text = '' + content.nAdmins;
                break;

            default:
                text = 'N/A';
                break;
            }

            textElem.appendChild(document.createTextNode(text));
            textElem.onclick = function() {
                // Signal the ClientList to switch rooms:
                node.emit('USEROOM', content.id);
            };
        }
        else {
            textElem = document.createTextNode(content);
        }

        return textElem;
    }

    function RoomList(options) {
        this.id = options.id;

        this.root = null;
        this.channelName = options.channel || null;
        this.table = new Table({
            render: {
                pipeline: renderCell,
                returnAt: 'first'
            }
        });

        // Create header:
        this.table.setHeader(['Name', 'ID',
                              '# Clients', '# Players', '# Admins']);
    }

    RoomList.prototype.getRoot = function() {
        return this.root;
    };

    RoomList.prototype.setChannel = function(channelName) {
        this.channelName = channelName;
    };

    RoomList.prototype.refresh = function() {
        if ('string' !== typeof this.channelName) return;

        // Ask server for room list:
        node.socket.send(node.msg.create({
            target: 'SERVERCOMMAND',
            text:   'INFO',
            data: {
                type:    'ROOMS',
                channel: this.channelName
            }
        }));

        this.table.parse();
    };

    RoomList.prototype.append = function(root, ids) {
        this.root = root;

        root.appendChild(this.table.table);

        // Query server:
        this.refresh();

        return root;
    };

    RoomList.prototype.listeners = function() {
        var that;

        that = this;

        // Listen for server reply:
        node.on.data('INFO_ROOMS', function(msg) {
            that.writeRooms(msg.data);
        });

        // Listen for events from ChannelList saying to switch channels:
        node.on('USECHANNEL', function(channel) {
            that.setChannel(channel);

            // Query server:
            that.refresh();
        });
    };

    RoomList.prototype.writeRooms = function(rooms) {
        var roomName, roomObj;

        this.table.clear(true);

        // Create a row for each room:
        for (roomName in rooms) {
            if (rooms.hasOwnProperty(roomName)) {
                roomObj = rooms[roomName];

                this.table.addRow(
                        [roomObj, roomObj, roomObj, roomObj, roomObj]);
            }
        }

        this.table.parse();
    };

})(node);
