#!/bin/bash
# nodeGame install development version from sources script
# Copyright(c) 2015 Stefano Balietti
# MIT Licensed

# Default command paths.
node_path=node
npm_path=npm

print_usage() {
    echo "Usage: install.dev.sh [--node-path=...] [--npm-path=...]"
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
    echo "Found node.js version $node_version, but at least 0.10 required."
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
"nodegame-db nodegame-mongodb nodegame-generator"

# Return on failure immediately.
set -e

# Clone the repo, copy Git hooks.
git clone git@github.com:nodeGame/nodegame.git
cd nodegame
cp git-hooks/* .git/hooks/

# Install the dependencies.
$npm_path install smoosh
$npm_path install ya-csv
$npm_path install commander
$npm_path install docker
mkdir -p node_modules
cd node_modules
for module in $gitmodules
do  git clone "git@github.com:nodeGame/${module}.git"
done

# Install sub-dependencies, link to tracked dependencies.
(
    cd JSUS
    $npm_path install
)

(
    cd descil-mturk
    link_deps JSUS NDDB
    $npm_path install
)

(
    cd nodegame-mongodb
    $npm_path install
)

(
    cd nodegame-client
    link_deps JSUS NDDB shelf.js
    $npm_path install
)

(
    cd nodegame-generator
    link_deps JSUS
    $npm_path install
    # Link to executable from nodegame/bin.
    ln -s ../node_modules/nodegame-generator/bin/nodegame ../../bin/
)

(
    cd nodegame-server
    link_deps JSUS NDDB shelf.js nodegame-widgets
    $npm_path install

    # Patch express connect. (not needed in express 4).
    # patch node_modules/express/node_modules/connect/lib/middleware/static.js < \
    #  bin/ng.connect.static.js.patch

    # Rebuild js files.
    $node_path bin/make.js build-client -a -o nodegame-full
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
$npm_path install
cd ../..


# Execute the following commands to try out the ultimatum game.

# Start the server:
# node launcher

# Open two browser tabs for two players at the address:
# http://localhost:8080/ultimatum/
# Open the admin interface at:
# http://localhost:8080/ultimatum/monitor/
# See the wiki documentation to modify settings.
