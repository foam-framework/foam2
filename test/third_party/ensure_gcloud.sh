#!/bin/bash

# set -ev

BASE_DIR=$(readlink -f $(dirname "$0"))
GCLOUD_SDK_URL="https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-145.0.0-linux-x86_64.tar.gz"
GCLOUD_SDK_TGZ="$BASE_DIR/google-cloud-sdk.tar.gz"
GCLOUD_PATH="$(which gcloud)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

function win() {
    printf "\n${GREEN}$1${NC}\n"
}

function warn() {
    printf "\n${YELLOW}$1${NC}\n"
}

function error() {
    printf "\n${RED}$1${NC}\n"
}

CDS_EMULATOR_PID=""
CDS_EMULATOR_DIR=""
JASMINE_PID=""
JASMINE_CODE=""

function stop() {
  if [ "$JASMINE_PID" != "" ]; then
    warn "STOPPING JASMINE (PID=$JASMINE_PID)"
    kill $JASMINE_PID
  fi
  win "JASMINE STOPPED"

  if [ "$CDS_EMULATORWP_PID" != "" ]; then
    warn "STOPPING CLOUD DATASTORE EMULATOR (PID=$CDS_EMULATOR_PID)"
    kill $CDS_EMULATORWP_PID
  fi
  win "CLOUD DATASTORE EMULATOR STOPPED"

  if [ "$CDS_EMULATOR_DIR" != "" ]; then
    warn "DELETING CLOUD DATASTORE EMULATOR DIR: $CDS_EMULATOR_DIR"
    rm -rf "$CDS_EMULATOR_DIR"
  fi

  if [ "$JASMINE_CODE" != "" ]; then
    warn "EXIT CODE $JASMINE_CODE"
    exit $JASMINE_CODE
  else
    error "SIGINT BEFORE JASMINE EXIT"
    exit 1
  fi
}

# trap stop INT

if [ "$GCLOUD_PATH" == "" ]; then
  curl -o "$GCLOUD_SDK_TGZ" "$GCLOUD_SDK_URL"
  pushd "$BASE_DIR"
  tar xzvf "$GCLOUD_SDK_TGZ"
  "./google-cloud-sdk/install.sh" -q --override-components cloud-datastore-emulator
  export PATH="$(pwd)/google-cloud-sdk/bin:$PATH"
  popd
fi

GCLOUD_BIN_DIR=$(readlink -f $(dirname $(which gcloud)))
CDS_EMULATOR="$GCLOUD_BIN_DIR/../platform/cloud-datastore-emulator/cloud_datastore_emulator"

if [ ! -f "$CDS_EMULATOR" ]; then
  error "Failed to install Cloud Datastore Emulator"
  exit 1
fi

export CDS_PROJECT_ID="test-project-$RANDOM"

export CDS_EMULATOR_PROTOCOL="http:"
export CDS_EMULATOR_HOST="localhost"
export CDS_EMULATOR_PORT=$((($RANDOM % 1000) + 8000))
export CDS_EMULATOR_DIR="$BASE_DIR/.cds-$CDS_EMULATOR_PORT"

mkdir "$CDS_EMULATOR_DIR"
"$CDS_EMULATOR" create --project_id=$CDS_PROJECT_ID "$CDS_EMULATOR_DIR"
"$CDS_EMULATOR" start --host=$CDS_EMULATOR_HOST --port=$CDS_EMULATOR_PORT --store_on_disk=True --consistency=0.9 --allow_remote_shutdown "$CDS_EMULATOR_DIR" &
export CDS_EMULATOR_PID=$!

# JASMINE_CONFIG_PATH="$BASE_DIR/../../jasmine_gcloud.json" node --inspect "$BASE_DIR/inspect.es6.js" "$BASE_DIR/../../node_modules/.bin/jasmine" &
# JASMINE_PID=$!
# wait $JASMINE_PID
# JASMINE_CODE=$?

# stop
