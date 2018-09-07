#!/bin/bash
# nodeGame install development version from sources script
# Copyright(c) 2015 Stefano Balietti
# MIT Licensed


# List of all sub-modules on GitHub to clone.
# The order is important because of dependencies (see installation
# of modules below).
gitmodules="nodegame-window nodegame-widgets JSUS NDDB shelf.js "\
"nodegame-client nodegame-server descil-mturk nodegame-db nodegame-mongodb "\
"nodegame-requirements nodegame-monitor nodegame-game-template"

# Usage information.
read -r -d '' usage_info <<EOT
Usage: $(basename $0) [-g <git-modules>] [-n <npm-modules>]
Defaults:
 git-modules: "$gitmodules"
 npm-modules: "$npmmodules"
It is recommended to give the git-modules in the same order as defined
in this script.
EOT


# Parse arguments.
while getopts "h?g:n:" arg
do  case $arg in
    g)  gitmodules=$OPTARG
        ;;
    n)  npmmodules=$OPTARG
        ;;
    *)  echo "$usage_info"
        exit
        ;;
    esac
done


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


# Return on failure immediately.
set -e

# Clone the nodegame repo and enter its directory.
if [ ! -d nodegame ]
then
    git clone https://github.com/nodeGame/nodegame.git
    cd nodegame
else
    # If the nodegame directory already exists and is not empty, git will
    # refuse to clone into it.
    # Instead, it has to be set up manually.
    # http://stackoverflow.com/a/18999726/3347292
    cd nodegame
    git init
    git remote add origin https://github.com/nodeGame/nodegame.git
    git fetch
    git checkout -t origin/master
fi

# Install the dependencies.

# NPM dependencies.
npm install

# GitHub dependencies.
cd node_modules
for module in $gitmodules
do  git clone "https://github.com/nodeGame/${module}.git"
    # Get sub-dependencies, link to tracked dependencies.
    cd "$module"
    case $module in
    JSUS|nodegame-mongodb)
        npm install
        ;;
    descil-mturk)
        link_deps JSUS NDDB
        npm install
        ;;
    nodegame-client)
        link_deps JSUS NDDB shelf.js
        npm install
        ;;
    nodegame-server)
        link_deps JSUS NDDB shelf.js
        npm install
        # Patch express connect. (not needed in express 4).
        # patch \
        #  node_modules/express/node_modules/connect/lib/middleware/static.js < \
        #  bin/ng.connect.static.js.patch
        # Rebuild js files.
        node bin/make.js build-client -a -o nodegame-full
        ;;
    esac
    cd ..
done

echo "Installation of nodeGame for module completed."
