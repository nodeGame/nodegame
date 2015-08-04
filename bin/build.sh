#! /bin/bash
# nodegame/bin

# nodegame/node_modules/nodegame-window
cd ../node_modules/nodegame-window
node bin/make build -a

# nodegame/node_modules/nodegame-widgets
cd ../nodegame-widgets
node bin/make build -a

# nodegame/node_modules/nodegame-server
cd ../nodegame-server
node bin/make build-css
node bin/make build-client -a -o nodegame-full

# nodegame
cd ../..
node $1 launcher.js
