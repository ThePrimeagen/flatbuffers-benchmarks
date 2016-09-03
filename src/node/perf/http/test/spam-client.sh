#!/usr/bin/env bash

url=$1
count=$2
is_json=$3
counter=0

if [ is_json == 'true' ]; then
    app="application/json"
else
    app="application/octet-stream"
fi

while [ $counter -lt $count ]; do
    curl -s "$url" -H "Content-Type: $app" > /dev/null
    counter=$(($counter+1))
done
