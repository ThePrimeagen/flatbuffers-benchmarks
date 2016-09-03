#!/usr/bin/env bash

URL=$1
IS_JSON=$2

if [ -z "$URL" ]; then
    echo "No URL Provided, please provide a second argument as url"
    exit 1
fi

if [ -z "$IS_JSON" ]; then
    echo "No IS_JSON defined";
    echo "Defaulting to true";

    export IS_JSON="true"
fi

COUNTER=0
ID=0

while [ $COUNTER -lt 3 ]
do
    ID=$(($ID + 1))
    echo "sh spam-client.sh $URL 5000 $IS_JSON &"
    sh spam-client.sh "$URL" 5000 $IS_JSON &

    COUNTER=$(($COUNTER + 1))
done

# Blocks on this one.
ID=$(($ID + 1))
sh spam-client.sh "$URL" 5000 $IS_JSON

