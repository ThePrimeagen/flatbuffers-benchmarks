#!/usr/bin/env bash
cd src/node/perf/tcp/test

if [ "$1" == "lolomo" ]; then
    node run-lolomo-as-a-service.js --port=$2
elif [ "$1" == "ratings" ]; then
    node run-ratings-as-a-service.js --port=$2
elif [ "$1" == "agg" ]; then
    node run-lolomo-ratings-aggregation-as-a-service.js --port=$2 --ratingsPort=$2 --lolomoPort=$2 --lolomoHost=$3 --ratingsHost=$4 --host=0.0.0.0
fi
