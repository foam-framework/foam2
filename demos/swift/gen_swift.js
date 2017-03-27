#!/usr/bin/env node

global.FOAM_FLAGS = {
  'node': true,
  'swift': true,
  'debug': true,
};

var execSync = require('child_process').execSync

var dir = __dirname;
var root = dir + '/../..';
var genDir = dir + '/gen';

require(root + '/src/foam.js');
execSync('rm -rf ' + genDir);

var executor = foam.classloader.NodeJsModelExecutor.create({
  classpaths: [
    dir + '/../../src',
    dir + '/js',
    dir + '/../../src/com/google/foam/demos/tabata',
  ],
  modelId: 'GenSwift',
  modelArgs: {
    models: [
      'Test',
      'TestExtended',
      'foam.swift.core.Slot',
      'foam.swift.core.PropertySlot',
      'foam.swift.core.ExpressionSlot',
      'foam.swift.core.ConstantSlot',
      'foam.swift.parse.PStream',
      'foam.swift.parse.StringPStream',
      'foam.swift.parse.parser.Alt',
      'foam.swift.parse.parser.Not',
      'foam.swift.parse.parser.AnyChar',
      'foam.swift.parse.parser.NotChars',
      'foam.swift.parse.parser.Repeat0',
      'foam.swift.parse.parser.Seq',
      'foam.swift.parse.parser.Seq0',
      'foam.swift.parse.parser.Seq1',
      'foam.swift.parse.parser.Seq2',
      'foam.swift.parse.parser.Substring',
      'foam.swift.parse.parser.Repeat',
      'foam.swift.parse.parser.Chars',
      'foam.swift.parse.parser.NotChar',
      'foam.swift.parse.parser.Optional',
      'foam.swift.parse.parser.ProxyParser',
      'foam.swift.parse.parser.Fail',
      'foam.swift.parse.parser.Literal',
      'foam.swift.parse.json.output.Outputter',
      'foam.swift.parse.json.AnyKeyParser',
      'foam.swift.parse.json.AnyParser',
      'foam.swift.parse.json.ArrayParser',
      'foam.swift.parse.json.BooleanParser',
      'foam.swift.parse.json.DateParser',
      'foam.swift.parse.json.ExprParser',
      'foam.swift.parse.json.FObjectArrayParser',
      'foam.swift.parse.json.FObjectParser',
      'foam.swift.parse.json.FObjectParser_',
      'foam.swift.parse.json.IntParser',
      'foam.swift.parse.json.KeyParser',
      'foam.swift.parse.json.LongParser',
      'foam.swift.parse.json.MapParser',
      'foam.swift.parse.json.NullParser',
      'foam.swift.parse.json.PropertyParser',
      'foam.swift.parse.json.Whitespace',
      'foam.swift.parse.json.FloatParser',
      'foam.swift.parse.json.StringParser',
      'foam.swift.parse.parser.Parser',
      'foam.swift.ui.DetailView',
      'foam.swift.ui.FOAMUITextFieldInt',
      'foam.swift.ui.FOAMActionUIButton',
      'foam.swift.ui.FOAMUILabel',
      'foam.swift.ui.FOAMUITextField',
      'foam.dao.DAO',
      'foam.mlang.predicate.Predicate',
      'foam.mlang.order.Comparator',
      'foam.dao.Sink',
      'foam.dao.ProxySink',
      'foam.dao.LimitedSink',
      'foam.dao.OrderedSink',
      'foam.dao.PredicatedSink',
      'foam.dao.SkipSink',
      'foam.swift.dao.ArraySink',
      'foam.dao.ResetListener',
      'foam.swift.dao.AbstractDAO',
      'foam.swift.dao.ArrayDAO',
      'somepackage.RequiredClass',
      'TabataState',
      'Tabata',
      'foam.util.Timer',
    ],
    outdir: genDir,
  },
});
executor.execute();
