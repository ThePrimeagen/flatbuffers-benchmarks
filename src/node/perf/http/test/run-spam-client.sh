#!/usr/bin/env bash

export ROWS=$1
export COLUMNS=$2

CLIENT_ID=$3
IS_JSON=$4
COUNT=$5

if [ -z "$SERVER_ADDR" ]; then
    echo "No SERVER_ADDR defined";
    echo "Defaulting to local host";

    export SERVER_ADDR="localhost"
fi
if [ -z "$COUNT" ]; then
    echo "No COUNT defined";
    echo "Defaulting to 4";

    export COUNT="4"
fi
if [ -z "$IS_JSON" ]; then
    echo "No IS_JSON defined";
    echo "Defaulting to true";

    export IS_JSON="true"
fi



COUNTER=0
ID=0

while [ $COUNTER -lt $COUNT ]
do
    ID=$(($ID + 1))
    echo "sh spam-client.sh 1 $ID $IS_JSON &"
    sh spam-client.sh 1 $ID $IS_JSON &

    COUNTER=$(($COUNTER + 1))
done

# Blocks on this one.
ID=$(($ID + 1))
sh spam-client.sh 1 $ID $IS_JSON
