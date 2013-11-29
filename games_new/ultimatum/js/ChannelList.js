/**
 * # ChannelList widget for nodeGame
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Shows current, previous and next state.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('ChannelList', ChannelList);

    var JSUS = node.JSUS,
    Table = node.window.Table;

    // ## Defaults

    ChannelList.defaults = {};
    ChannelList.defaults.id = 'channellist';
    ChannelList.defaults.fieldset = {
        legend: 'Channels',
        id: 'channellist_fieldset'
    };

    // ## Meta-data

    ChannelList.version = '0.1.0';
    ChannelList.description = 'Visually display all channels on the server.';

    // ## Dependencies

    ChannelList.dependencies = {
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
                text = '' + content.nGameRooms;
                break;

            case 2:
                text = content.nConnClients +
                       ' (+' + content.nDisconnClients + ')';
                break;

            case 3:
                text = content.nConnPlayers +
                       ' (+' + content.nDisconnPlayers + ')';
                break;

            case 4:
                text = content.nConnAdmins +
                       ' (+' + content.nDisconnAdmins + ')';
                break;
            }

            textElem.appendChild(document.createTextNode(text));
            textElem.onclick = function() {
                alert(content.name);
            };
        }
        else {
            textElem = document.createTextNode(content);
        }

        return textElem;
    }

    function ChannelList(options) {
        this.id = options.id;

        this.root = null;
        this.table = new Table({
            render: {
                pipeline: renderCell,
                returnAt: 'first'
            }
        });

        // Create header:
        this.table.setHeader(['Name', '# Rooms',
                              '# Clients, Connected (+ Disconnected)',
                              '# Players', '# Admins']);
    }

    ChannelList.prototype.getRoot = function() {
        return this.root;
    };

    ChannelList.prototype.append = function(root, ids) {
        root.appendChild(this.table.table);

        // Ask server for channel list:
        node.socket.send(node.msg.create({
            target: 'SERVERCOMMAND',
            text:   'INFO',
            data: {
                type:      'CHANNELS',
                extraInfo: true
            }
        }));

        this.table.parse();

        return root;
    };

    ChannelList.prototype.listeners = function() {
        var that;

        that = this;

        node.on.data('INFO_CHANNELS', function(msg) {
            that.writeChannels(msg.data);
        });
    };

    ChannelList.prototype.writeChannels = function(channels) {
        var chanKey, chanObj;

        this.table.clear(true);

        // Create a row for each channel:
        for (chanKey in channels) {
            if (channels.hasOwnProperty(chanKey)) {
                chanObj = channels[chanKey];

                this.table.addRow(
                        [chanObj, chanObj, chanObj, chanObj, chanObj]);
            }
        }

        this.table.parse();
    };

})(node);
