#!/bin/bash
set -e
trap "kill 0" EXIT

cd `dirname $0`
scriptdir=$(pwd)

if [ "$1" == "" ]; then
  TARGET_DIR="."
  echo "You can pass target directory for output config file, Default is where you run"
else
  TARGET_DIR=$1
fi

tmpFile="$TARGET_DIR/verde-ethereum.log"
echo 'Starting ganache ...'
echo "Log file for ganache is located at $tmpFile"

ganache-cli --unlock 0,1 > $tmpFile &
sleep 2 #wait for ganache to start

echo "Deploying contracts ..."
cd $scriptdir
rm -f build/contracts/*.json
MIGRATE=$(truffle migrate)

TMP=($(echo "$MIGRATE" | grep "Requests:"))
REQUESTS_CONTRACT_ADDR=${TMP[1]}

#TMP=($(echo "$MIGRATE" | grep "Condition:"))
#CONDITION_CONTRACT_ADDR=${TMP[1]}
#TMP=($(echo "$MIGRATE" | grep "User:"))
#USER_CONTRACT_ADDR=${TMP[1]}

TMP=($(echo "$MIGRATE" | grep "UserDirectory:"))
DIRECTORY_CONTRACT_ADDR=${TMP[1]}

write_config () {
  i=5
  echo '{'

  echo '  "partyAddress": ['
  while [ $i -lt 14 ]; do
    tmpArr=($(cat $tmpFile | sed "${i}q;d"))
    echo "    ${tmpArr[1]},"
    i=$(($i + 1))
  done
  tmpArr=($(cat $tmpFile | sed "${i}q;d"))
  echo "    ${tmpArr[1]}"
  echo '  ],'

  echo '  "contractAddress":  {'
  echo -n '    "request": '
  echo $REQUESTS_CONTRACT_ADDR
  echo -n '    "directory": '
  echo $DIRECTORY_CONTRACT_ADDR
  echo '  }'

  echo '}'
}

touch $TARGET_DIR/verde-config.json
write_config > $TARGET_DIR/verde-config.json

echo "Ethereum ready, config file is at $TARGET_DIR/verde-config.json"

wait