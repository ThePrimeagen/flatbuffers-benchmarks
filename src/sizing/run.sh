#!/bin/bash

# makes the dir just in case its not there
mkdir results

COUNTER=1
while [ $COUNTER -lt 41 ]; do
    echo "Running $COUNTER"
    node --expose-gc ./index.js $COUNTER 75
    if [ $COUNTER == 1 ]; then
        let COUNTER=4
    else
        let COUNTER+=4
    fi
done

for file in results/*.data; do gzip -c "$file" > "$file.gz"; done