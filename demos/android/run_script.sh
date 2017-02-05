#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

rm $DIR/gen/*
mkdir -p $DIR/gen

read -r -d '' ARGS << EOM
{
  classpaths: [
    '$DIR/../../src',
    '$DIR/js'
  ],
  modelId: 'foam.android.GenStrings',
  modelArgs: {
    models: [
      'nodetooldemo.Test',
    ],
    outfile: '$DIR/gen/strings.xml',
  },
  locale: 'en',
}
EOM
node $DIR/../../tools/node.js "$ARGS"

read -r -d '' ARGS << EOM
{
  classpaths: [
    '$DIR/../../src',
    '$DIR/js'
  ],
  modelId: 'foam.android.GenStrings',
  modelArgs: {
    models: [
      'nodetooldemo.Test',
    ],
    outfile: '$DIR/gen/strings-fr.xml',
  },
  locale: 'fr',
}
EOM
node $DIR/../../tools/node.js "$ARGS"
