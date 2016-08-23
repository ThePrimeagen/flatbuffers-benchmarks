#!/usr/bin/env bash

export ROWS=$1
export COLUMNS=$2

CLIENT_ID=$3
IS_JSON=$4
COUNT=$5

COUNTER=0
ID=0

while [ $COUNTER -lt "$COUNT" ]; do
    ID=$(($COUNTER + $CLIENT_ID))
    echo "sh spam-client.sh 5000 $ID $IS_JSON &"
    sh spam-client.sh 5000 $ID $IS_JSON &

    COUNTER=$(($COUNTER + 1))
done

# Blocks on this one.
ID=$(($COUNTER + $CLIENT_ID))
sh spam-client.sh 5000 $ID $IS_JSON

