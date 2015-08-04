#!/bin/bash
# nodeGame install development version from sources script
# Copyright(c) 2015 Stefano Balietti
# MIT Licensed


# Check node.js version, must be higher than 0.8.
node_version=$(node --version)  # e.g. "v0.10.20"
node_version=${node_version#v}  # e.g. "0.10.20"
node_major=$(cut -d. -f1 <<< $node_version)
node_minor=$(cut -d. -f2 <<< $node_version)
if (( node_major <= 0 && node_minor < 10 ))
then
    echo "Found node.js version $node_version, but at least 0.10 required."
    exit 1
fi


# Add symbolic links to given dependencies that are in nodegame/node_modules
# (e.g. JSUS, NDDB).
link_deps() {
    mkdir -p node_modules
    (
        cd node_modules
        for dep in "$@"
        do  ln -s "../../$dep" .
        done
    )
}


# List of all sub-modules on GitHub to clone.
gitmodules="nodegame-client nodegame-server nodegame-window nodegame-widgets "\
"nodegame-requirements nodegame-monitor JSUS NDDB shelf.js descil-mturk "\
"nodegame-db nodegame-mongodb"

# Return on failure immediately.
set -e

# Clone the repo, copy Git hooks.
git clone git@github.com:nodeGame/nodegame.git
cd nodegame
cp git-hooks/* .git/hooks/

# Install the dependencies.
mkdir -p node_modules
cd node_modules
for module in $gitmodules
do  git clone "git@github.com:nodeGame/${module}.git"
done
npm install smoosh
npm install ya-csv
npm install commander
npm install docker

# Install sub-dependencies, link to tracked dependencies.
(
    cd JSUS
    npm install
)

(
    cd descil-mturk
    link_deps JSUS NDDB
    npm install
)

(
    cd nodegame-mongodb
    npm install
)

(
    cd nodegame-client
    link_deps JSUS NDDB shelf.js
    npm install
)

(
    cd nodegame-server
    link_deps JSUS NDDB shelf.js nodegame-widgets
    npm install

    # Patch express connect. (not needed in express 4).
    # patch node_modules/express/node_modules/connect/lib/middleware/static.js < \
    #  bin/ng.connect.static.js.patch

    # Rebuild js files.
    node bin/make.js build-client -a -o nodegame-full
)

# Copy Git hooks.
for module in $gitmodules
do  cp ../git-hooks/* "${module}/.git/hooks/"
done

# Install ultimatum game under nodegame/games.
cd ..
git clone git@github.com:nodeGame/ultimatum games/ultimatum
cp git-hooks/* games/ultimatum/.git/hooks/
cd games/ultimatum
npm install
cd ../..


# Execute the following commands to try out the ultimatum game.

# Start the server:
# node launcher

# Open two browser tabs for two players at the address:
# http://localhost:8080/ultimatum/
# Open the admin interface at:
# http://localhost:8080/ultimatum/monitor/
# See the wiki documentation to modify settings.
