#!/bin/bash
# nodeGame install from sources script
# Copyright(c) 2016 Stefano Balietti
# MIT Licensed

# Current dir.
# install_dir=${PWD##*/} # was.
install_dir=${PWD}

# Assumes to be executed inside the node_modules dir.
create_generator_conf() {
    echo
    echo "Saving nodegame-generator configuration"
    echo -e "{
    \"author\": \"\",
    \"email\": \"\",
    \"gamesFolder\": \"$install_dir/nodegame/games/\"
}" > nodegame-generator/conf/generator.conf.json
}

# Default command paths.
node_path=node
npm_path=npm

print_usage() {
    echo "Usage: install.latest.sh [--node-path=...] [--npm-path=...]"
    echo -n "  The path options select the location "
    echo "of the respective executables."
}

# Check options.
getopt_tmp=`getopt -o h --long help,node-path:,npm-path: -- "$@"`
if [ $? -ne 0 ]
then
    echo
    print_usage
    exit 1
fi

eval set -- "$getopt_tmp"
while true ; do
    case "$1" in
        -h|--help)
            print_usage
            exit 0
            shift ;;
        --node-path)
            node_path="$2"
            shift 2 ;;
        --npm-path) 
            npm_path="$2"
            shift 2 ;;
        --) shift ; break ;;
        *) echo "Error parsing options!" ; exit 1 ;;
    esac
done

# Check existence of executables.
command -v $node_path > /dev/null || {
    node_path=nodejs
    command -v $node_path > /dev/null
} || {
    echo "Invalid node path at '$node_path'."
    echo
    print_usage
    exit 1
}
command -v $npm_path > /dev/null || {
    echo "Invalid npm path at '$npm_path'."
    echo
    print_usage
    exit 1
}

# Check node.js version, must be at least 0.10.
node_version=$($node_path --version)  # e.g. "v0.10.20"
node_version=${node_version#v}  # e.g. "0.10.20"
node_major=$(cut -d. -f1 <<< $node_version)
node_minor=$(cut -d. -f2 <<< $node_version)
if (( node_major <= 0 && node_minor < 10 ))
then
    echo "node.js version >= 0.10 required."
    echo
    print_usage
    exit 1
fi

# Check npm version, must be at least 1.3.
npm_version=$($npm_path --version)
npm_major=$(cut -d. -f1 <<< $npm_version)
npm_minor=$(cut -d. -f2 <<< $npm_version)
if (( npm_major < 1 || npm_major == 1 && npm_minor < 3 ))
then
    echo "npm version >= 1.3 required."
    echo
    print_usage
    exit 1
fi

# Return on failure immediately.
set -e

# Clone the main repo.
git clone https://github.com/nodeGame/nodegame.git
cd nodegame

# Install npm dependencies.
$npm_path install
# Install git dependencies.
cd node_modules
git clone https://github.com/nodeGame/nodegame-client.git
git clone https://github.com/nodeGame/nodegame-server.git
git clone https://github.com/nodeGame/nodegame-window.git
git clone https://github.com/nodeGame/nodegame-widgets.git
git clone https://github.com/nodeGame/nodegame-requirements.git
git clone https://github.com/nodeGame/nodegame-game-template.git
git clone https://github.com/nodeGame/nodegame-monitor.git
git clone https://github.com/nodeGame/JSUS.git
git clone https://github.com/nodeGame/NDDB.git
git clone https://github.com/nodeGame/shelf.js.git
git clone https://github.com/nodeGame/descil-mturk.git
git clone https://github.com/nodeGame/nodegame-db.git
git clone https://github.com/nodeGame/nodegame-mongodb.git
git clone https://github.com/nodeGame/nodegame-generator.git

# Create conf script in nodegame-generator.
create_generator_conf

# Add symbolic links to given dependencies that are in nodegame/node_modules
# (e.g. JSUS, NDDB).
function link_deps {
    mkdir -p node_modules
    (
        cd node_modules
        for dep in "$@"
        do  ln -s "../../$dep" .
        done
    )
}

# Install sub-dependencies, link to tracked dependencies.
cd JSUS
$npm_path install

cd ../descil-mturk
link_deps JSUS NDDB
$npm_path install

cd ../nodegame-mongodb
$npm_path install

cd ../nodegame-client
link_deps JSUS NDDB shelf.js
$npm_path install
# Link to executable from nodegame/bin.
ln -s ../node_modules/nodegame-generator/bin/nodegame ../../bin/

cd ../nodegame-generator
link_deps JSUS
$npm_path install

cd ../nodegame-server
link_deps JSUS NDDB shelf.js nodegame-widgets nodegame-monitor
$npm_path install

# Patching express connect. (not needed in express 4)
# patch node_modules/express/node_modules/connect/lib/middleware/static.js < \
# bin/ng.connect.static.js.patch

# Rebuild js files.
cd bin
$node_path make build-client -a -o nodegame-full

# Install ultimatum game.
cd ../../..
git clone https://github.com/nodeGame/ultimatum games/ultimatum
cd games/ultimatum
link_deps fs-extra


# Execute the following commands to try out the ultimatum game.

# Start the server:
# node launcher

# Open two browser tabs for two players at the address:
# http://localhost:8080/ultimatum/
# Open the admin interface at:
# http://localhost:8080/ultimatum/monitor/
# See the wiki documentation to modify settings.
