# /usr/bin/env bash

if [[ "$#" -lt 1 ]]; then
    echo "Illegal number of args.  At least one argument should be provided."
    exit 1
fi

rows=40;
columns=75;
isJSON=true
port=33333
host="localhost"
maxCount=50000
mutationCount=10
script="index.js"
percentSimilar=0.1

HELP="-h"

# go through and pluck all the args.
assignValue=0
key=""
counter=1
maxCount="$#"
id=""
for var in "$@"
do
    if [[ $assignValue -eq 1 ]]; then
        case "$key" in
        "-r")
            rows="$var"
            ;;
        "-c")
            columns="$var"
            ;;
        "-m")
            maxCount="$var"
            ;;
        "-j")
            isJSON="$var"
            ;;
        "-i")
            id="$var"
            ;;
        "-p")
            port="$var"
            ;;
        "-o")
            host="$var"
            ;;
        "-s")
            percentSimilar="$var"
            ;;
        "-u")
            mutationCount="$var"
            ;;
        esac
        assignValue=0
        key=""

    elif [ "$var" == "$HELP" ]; then
        echo "------- Runner -------"
        echo "-h : Help menu"
        echo "-o : Host to run off of (default localhost)"
        echo "-p : Port to use, default 33333."
        echo "-u : The amount of mutation that should occur."
        echo "-s : The amount of content that is the same in the lolomo."
        echo "-i : A way to set the client ID."
        echo "-j : Boolean for whether or not to respond in JSON."
        echo "-c : Column count for the Lolomo Generator."
        echo "-r : Row count for the Lolomo Generator."
        exit 0

    # Next value should be assigned
    elif [ "$counter" -lt "$maxCount" ]; then

        assignValue=1
        key="$var"
    else
        # If there is a last argument, then its the script
        # If there is not, then the script is defaulted to index.js
        script="$var"
    fi
    counter=$((counter+1))
done


echo "rows:$rows columns:$columns maxCount:$maxCount isJSON:$isJSON isServer:$isServer script:$script"
time (
      export ROWS=$rows &&
      export COLUMNS=$columns &&
      export IS_JSON=$isJSON &&
      export MAX_COUNT=$maxCount &&
      export FB_CLIENT_ID=$id &&
      export HOST=$host &&
      export PORT=$port &&
      export MUTATION_COUNT=$mutationCount &&
      export PERCENT_SIMILAR=$percentSimilar &&
      node $script)
