# /usr/bin/env bash

SCRIPT=$1
PERCENT_MUTATION=$2

if [ -z "$SCRIPT" ]; then
    echo "Please provide the path to the script to execute"
    exit 1
fi

if [ -z "$PERCENT_MUTATION" ]; then
    PERCENT_MUTATION=0.25
fi

time (export PERCENT_MUTATION=$PERCENT_MUTATION && \
      export ROW=40 &&
      export COLUMN=40 &&
      export IS_JSON=true &&
      export IS_SERVER=false &&
      export MAX_COUNT=50000 &&
      node $SCRIPT)
