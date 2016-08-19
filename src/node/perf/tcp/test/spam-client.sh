#!/usr/bin/env bash

len=$1
counter=0

while [ $counter -lt $len ]; do
    curl -s http://$SERVER_ADDR:33333/lolomo/$2/$ROW_COUNT/$COLUMN_COUNT/0/false/$3 > /dev/null
    counter=$(($counter+1))
done
