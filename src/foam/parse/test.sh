#!/bin/bash

# Attempted to setup environment variables but was unsuccesful passing them to curl
#PATH="service/dig"
DAO="regionDAO"
#URL="$HOST$PATH?dao=$DAO&q=$QUERY"
PASS=0
FAIL=1
STATUS_CODE=
QUERY=
PORT='8080'
USERNAME=''
PASSWORD=''
ADDRESS='localhost'
#                      --silent \
function send_quiet {
    STATUS_CODE=$(/usr/bin/curl --write-out %{http_code} \
                                --silent \
                                --output out.html \
                                -X GET \
                                -u "$USERNAME"':'"$PASSWORD" \
                                'http://'"$ADDRESS"':'"$PORT"'/service/dig?dao='$DAO'&q='$QUERY \
                                -H 'accept: application/json' \
                                -H 'cache-control: no-cache' \
                                -H 'content-type: application/json')
}

function send_verbose {
    /usr/bin/curl --write-out %{http_code} \
                  --silent \
                  -X GET \
                  -u "$USERNAME"':'"$PASSWORD" \
                     'http://'"$ADDRESS"':'"$PORT"'/service/dig?dao='$DAO'&q='$QUERY \
                  -H 'accept: application/json' \
                  -H 'cache-control: no-cache' \
                  -H 'content-type: application/json'
}

function usage {
    echo "Usage: $0 EXPECTATION QUERY [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -u : Login username"
    echo "  -p : Login password"
    echo "  -h : Port on the host the server is running on: defaults to 8080"
    echo "  -a : Address of the host server: defaults to localhost"
    echo ""
}

function test () {
    EXPECTATION=$1
    QUERY=$2
    while getopts "upha" opt ; do
        case $opt in
            u) USERNAME=$OPTARG
               ;;
            p) PASSWORD=$OPTARG
               ;;
            h) PORT=$OPTARG
               ;;
            a) ADDRESS=$OPTARG
               ;;
        esac
    done
    printf "\n"
    if [ "$USERNAME" = '' ]
        echo "WARNING: Username is blank"
    fi
    if [ "$PASSWORD" = '' ]
        echo "WARNING: Password is blank"
    fi
    send_verbose
    send_quiet
    #printf "EXPECTATION=$EXPECTATION"
    if [ "$STATUS_CODE" != "200" ]; then
         if [ $EXPECTATION -eq $PASS ]; then
             printf "\n(1) FAIL ($STATUS_CODE) q=$QUERY"
         else
             printf "\n(2) PASS ($STATUS_CODE) q=$QUERY"
         fi
    elif grep -q "No data" out.html; then
         if [ $EXPECTATION -eq $PASS ]; then
             printf "\n(3) FAIL ($STATUS_CODE) NO_DATA q=$QUERY"
         else
             printf "\n(4) PASS ($STATUS_CODE) NO_DATA q=$QUERY"
         fi
    elif [ $EXPECTATION -eq $PASS ]; then
        printf "\n(5) PASS ($STATUS_CODE) q=$QUERY"
    else
        printf "\n(6) FAIL ($STATUS_CODE) q=$QUERY"
    fi
    printf "\n"

    if [ -f out.html ]; then
        rm out.html
    fi
}

# contains
test $PASS "name:Ontario"

# equals
test $PASS "name=Ontario"

# AND
test $PASS "name=Ontario%20AND%20countryId=CA"

# AND should fail with mispelling of Ontario
test $FAIL "name=Ontari%20AND%20countryId=CA"

# id 1 does not exist
test $FAIL "id=1"

# id
test $PASS "id=ON"

# id AND name
test $PASS "id=ON%20AND%20name=Ontario"
