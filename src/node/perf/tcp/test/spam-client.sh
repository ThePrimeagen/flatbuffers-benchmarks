#!/usr/bin/env bash

url=$1
len=$2
counter=0

while [ $counter -lt $len ]; do
    curl -s $url > /dev/null
    counter=$(($counter+1))
done
