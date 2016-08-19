#!/usr/bin/env bash
cd src/node/perf/tcp/test

if [ "$1" == "lolomo" ]; then
    node run-lolomo-as-a-service.js --port=33334
elif [ "$1" == "ratings" ]; then
    node run-ratings-as-a-service.js --port=33335
elif [ "$1" == "agg" ]; then
    node run-lolomo-ratings-aggregation-as-a-service.js --lolomoHost=$2 --ratingsHost=$3 --host=0.0.0.0
fi
