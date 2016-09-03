#!/usr/bin/env bash

URL=$1
CLIENT_ID=$2
SEND_COUNT=$3

if [ -z "$URL" ]; then
    echo "No URL Provided, please provide a second argument as url"
    exit 1
fi

if [ -z "$SEND_COUNT" ]; then
    echo "No SEND_COUNT (3rd argument) was provided, therefore default to 1000"
    SEND_COUNT=1000;
fi

COUNTER=0
ID=CLIENT_ID

while [ $COUNTER -lt 3 ]
do
    ID=$(($ID + 1))
    echo "sh spam-client.sh $URL&clientId=$ID $SEND_COUNT &"
    sh spam-client.sh "$URL&clientId=$ID" $SEND_COUNT &

    COUNTER=$(($COUNTER + 1))
done

# Blocks on this one.
ID=$(($ID + 1))
sh spam-client.sh "$URL&clientId=$ID" $SEND_COUNT

