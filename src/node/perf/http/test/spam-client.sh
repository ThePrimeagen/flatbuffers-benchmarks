#!/usr/bin/env bash

len=$1
IS_JSON=$2
counter=0

if [ IS_JSON == 'true' ]; then
    APP="application/json"
else
    APP="application/octet-stream"
fi

while [ $counter -lt $len ]; do
    echo "curl -s \"http://$SERVER_ADDR:33333/?rows=$ROWS&columns=$COLUMNS&clientId=$2\" -H \"Content-Type: $APP\" > /dev/null"
    curl -s "http://$SERVER_ADDR:33333/?rows=$ROWS&columns=$COLUMNS&clientId=$2" -H "Content-Type: $APP" > /dev/null
    counter=$(($counter+1))
done
