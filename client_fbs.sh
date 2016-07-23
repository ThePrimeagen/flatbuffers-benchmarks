# /usr/bin/env bash
HI_COUNT=$1
PERCENT_MUTATION=$2

if [ -z "$HI_COUNT" ]; then
    HI_COUNT=10
fi

if [ -z "$PERCENT_MUTATION" ]; then
    PERCENT_MUTATION=0.25
fi

time (export PERCENT_MUTATION=$PERCENT_MUTATION && \
      export HI_COUNT=$HI_COUNT && \
      export IS_JSON=false &&
      export IS_SERVER=false &&
      export MAX_COUNT=50000 &&
      node example/index.js)
