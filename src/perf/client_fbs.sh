# /usr/bin/env bash

if [[ "$#" -lt 1 ]]; then
    echo "Illegal number of args.  At least one argument should be provided."
    exit 1
fi

rows=40;
columns=75;
isJSON=true
isServer=true
maxCount=50000
script="index.js"

if [[ "$#" -gt 1 ]]; then
    # go through and pluck all the args.
    assignValue=0
    key=""
    counter=1
    maxCount="$#"
    for var in "$@"
    do
        echo "processing: $var aV:$assignValue k:$key counter:$counter"
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
            "-s")
                isServer="$var"
                ;;
            esac
            assignValue=0
            key=""

        # Next value should be assigned
        elif [ "$counter" -lt "$maxCount" ]; then
            assignValue=1
            key="$var"
        else
            # Last argument is the script
            script="$var"
        fi
        counter=$((counter+1))
    done

else
    script="$1"
fi


echo "rows:$rows columns:$columns maxCount:$maxCount isJSON:$isJSON isServer:$isServer script:$script"
# time (
#      export ROWS=$rows &&
#      export COLUMNS=$columns &&
#      export IS_JSON=$isJSON &&
#      export IS_SERVER=$isServer &&
#      export MAX_COUNT=$maxCount &&
#      node $SCRIPT)
