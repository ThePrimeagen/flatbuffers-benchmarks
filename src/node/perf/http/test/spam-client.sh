#!/usr/bin/env bash

len=$1
counter=0

while [ $counter -lt $len ]; do
    curl -s http://$SERVER_ADDR:$4/lolomo/$2/$ROWS/$COLUMNS/0/false/$3 > /dev/null
    counter=$(($counter+1))
done
