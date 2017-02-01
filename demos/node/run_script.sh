#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

read -r -d '' ARGS << EOM
{
  classpaths: [
    '$DIR/../../src',
    '$DIR/js'
  ],
  modelId: 'nodetooldemo.Test',
  modelArgs: {
    name: 'Joe',
  },
}
EOM

node $DIR/../../tools/node.js "$ARGS"
