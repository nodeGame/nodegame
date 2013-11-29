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
        var textElem;

        content = o.content;
        textElem = document.createElement('span');
        if ('object' === typeof content) {
            textElem.appendChild(document.createTextNode(content.name));
            textElem.onclick = function() {
                alert(content);
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
        this.table.setHeader(['Name', '# Rooms', '# Clients', '# Players',
                              '# Admins']);
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
            data:   'CHANNELS'
        }));

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
        var channelKey;

        this.table.clear(true);

        // Create a row for each channel:
        for (channelKey in channels) {
            if (channels.hasOwnProperty(channelKey)) {
                this.table.addRow([channels[channelKey]]);
            }
        }

        this.table.parse();
    };

})(node);
