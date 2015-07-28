#!/bin/bash
#
# Pull recent versions of all included Git repos.

echo_and_pull() {
  echo -e "\n* Pulling $1 ..."
  git pull || echo '  FAILED!'
}

GAMES=(ultimatum)
MODULES=(nodegame-client nodegame-server nodegame-window nodegame-widgets
  nodegame-requirements nodegame-monitor JSUS NDDB shelf.js descil-mturk
  nodegame-db nodegame-mongodb)

# Change the current working directory to the parent directory of the script,
# i.e. the nodegame directory. Using the below command instead of simply
# "cd .." makes sure that it does not matter from where the script is executed
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo_and_pull nodegame

for GAME in "${GAMES[@]}"; do
(
  cd games/"${GAME}"
  echo_and_pull "${GAME}"
)
done

for MODULE in "${MODULES[@]}"; do
(
  cd node_modules/"${MODULE}"
  echo_and_pull "${MODULE}"
)
done

echo -e "\n* Done."
