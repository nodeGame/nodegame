#!/bin/sh
#
# Pull recent versions of all included Git repos.

#set -e

echo '* Pulling nodegame ...'
git pull || echo '  FAILED!'

echo
cd games/ultimatum
echo '* Pulling ultimatum ...'
git pull || echo '  FAILED!'

echo
cd ../../node_modules/nodegame-server
echo '* Pulling nodegame-server ...'
git pull || echo '  FAILED!'

echo
cd ../nodegame-client
echo '* Pulling nodegame-client ...'
git pull || echo '  FAILED!'

echo
cd ../nodegame-widgets
echo '* Pulling nodegame-widgets ...'
git pull || echo '  FAILED!'

echo
cd ../nodegame-window
echo '* Pulling nodegame-window ...'
git pull || echo '  FAILED!'

echo
cd ../nodegame-mongodb
echo '* Pulling nodegame-mongodb ...'
git pull || echo '  FAILED!'

echo
cd ../nodegame-db
echo '* Pulling nodegame-db ...'
git pull || echo '  FAILED!'

echo
cd ../JSUS
echo '* Pulling JSUS ...'
git pull || echo '  FAILED!'

echo
cd ../NDDB
echo '* Pulling JSUS ...'
git pull || echo '  FAILED!'

echo
cd ../shelf.js
echo '* Pulling JSUS ...'
git pull || echo '  FAILED!'

echo
cd ../descil-mturk
echo '* Pulling JSUS ...'
git pull || echo '  FAILED!'

echo
echo '* Done.'
