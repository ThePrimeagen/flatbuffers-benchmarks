# /usr/bin/env bash

SCRIPT=$1

if [ -z "$SCRIPT" ]; then
    echo "Please provide the path to the script to execute"
    exit 1
fi

time (export IS_JSON=true && node $SCRIPT)
