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
        var channel;
        var textElem;

        channel = o.content;
        textElem = document.createElement('span');
        textElem.appendChild(document.createTextNode(channel.name));
        textElem.onclick = function() {
            alert(channel);
        };

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

        for (channelKey in channels) {
            if (channels.hasOwnProperty(channelKey)) {
                this.table.addRow([channels[channelKey]]);
            }
        }

        this.table.parse();
    };

})(node);
