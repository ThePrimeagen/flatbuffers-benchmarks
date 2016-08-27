#!/usr/bin/env bash

export ROWS=$1
export COLUMNS=$2

CLIENT_ID=$3
IS_JSON=$4

COUNTER=0
ID=0

    sh spam-client.sh $5 $ID $IS_JSON 33333
    exit
while [ $COUNTER -lt 2 ]; do
    ID=$(($COUNTER + $CLIENT_ID))
    echo "sh spam-client.sh $5 $ID $IS_JSON &"
    sh spam-client.sh $5 $ID $IS_JSON 33333 &

    COUNTER=$(($COUNTER + 1))
done

while [ $COUNTER -lt 4 ]; do
    ID=$(($COUNTER + $CLIENT_ID))
    echo "sh spam-client.sh $5 $ID $IS_JSON &"
    sh spam-client.sh $5 $ID $IS_JSON 33334 &

    COUNTER=$(($COUNTER + 1))
done

ID=$(($COUNTER + $CLIENT_ID))
ID_2=$(($COUNTER + $CLIENT_ID + 1))
echo "sh spam-client.sh $5 $ID $IS_JSON &"
sh spam-client.sh $5 $ID $IS_JSON 33335 &

echo "sh spam-client.sh $5 $ID_2 $IS_JSON "
sh spam-client.sh $5 $ID_2 $IS_JSON 33335

