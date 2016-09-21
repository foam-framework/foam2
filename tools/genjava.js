require('../src/foam.js');

var classes = [
  'foam.mlang.predicate.Predicate',
  'foam.mlang.predicate.True',
  'foam.mlang.predicate.False',
  'foam.mlang.predicate.And',
  'foam.mlang.predicate.Or',
  'foam.mlang.predicate.AbstractPredicate',
  'foam.mlang.predicate.Nary',
  'foam.mlang.predicate.Unary',
  'foam.mlang.predicate.Binary',
  'foam.mlang.predicate.Contains',
  'foam.mlang.predicate.StartsWithIC',
  'foam.mlang.Expr',
  'foam.mlang.AbstractExpr',
  'foam.mlang.predicate.Eq',
  'foam.mlang.Constant',
  'foam.box.Box',
  'foam.box.Message',
  'foam.box.WrappedMessage',
  'foam.box.TextMessage',
  'foam.box.SubBoxMessage',
  'com.google.foam.demos.appengine.TestModel',
  'foam.box.HTTPReplyBox',
  'foam.box.EchoBox',
  'com.google.foam.demos.appengine.TestService',
  'com.google.foam.demos.heroes.Hero',
  'foam.box.RPCMessage',
  'foam.box.RPCReturnMessage',
  'foam.dao.DAO',
  'foam.dao.Sink',
  'foam.dao.AbstractSink',
  'foam.dao.PredicatedSink',
  'foam.dao.OrderedSink',
  'foam.dao.LimitedSink',
  'foam.dao.SkipSink',
  'foam.dao.FlowControl',
  'foam.mlang.order.Comparator',
  'foam.mlang.sink.Count'
];

var skeletons = [
  'com.google.foam.demos.appengine.TestService',
  'foam.dao.DAO'
];

var proxies = [
  'foam.dao.DAO',
  'foam.dao.Sink',
  'com.google.foam.demos.appengine.TestService'
];

if ( process.argv.length != 3 ) {
  console.log("USAGE: genjava.js output-path");
  process.exit(1);
}

var outdir = process.argv[2];
outdir = require('path').resolve(require('path').normalize(outdir));

function ensurePath(p) {
  var i = 1 ;
  var parts = p.split(require('path').sep);
  var path = '/' + parts[0];

  while ( i < parts.length ) {
    try {
      var stat = require('fs').statSync(path);
      if ( ! stat.isDirectory() ) throw path + 'is not a directory';
    } catch(e) {
      require('fs').mkdirSync(path);
    }

    path += require('path').sep + parts[i++];
  }
}

function loadClass(next) {
  return function(c) {
    // Poor mans class loader.
    if ( ! foam.lookup(c, true) ) require('../src/' + c.replace(/\./g, '/') + '.js');
    var cls = foam.lookup(c);
    return next(cls);
  };
}


function generateClass(cls) {
  var outfile = outdir + require('path').sep +
    cls.id.replace(/\./g, require('path').sep) + '.java';

  ensurePath(outfile);

  require('fs').writeFileSync(outfile, cls.buildJavaClass().toJavaSource());
}

function generateSkeleton(cls) {

  var outfile = outdir + require('path').sep +
    cls.package.replace(/\./g, require('path').sep) +
    require('path').sep + cls.name + 'Skeleton.java';

  ensurePath(outfile);

  require('fs').writeFileSync(
    outfile,
    foam.java.Skeleton.create({ of: cls }).buildJavaClass().toJavaSource());
}

function generateProxy(intf) {
  var existing = foam.lookup(intf.package + '.Proxy' + intf.name, true);

  if ( existing ) {
    generateClass(existing);
    return;
  }

  var proxy = foam.core.Model.create({
    package: intf.package,
    name: 'Proxy' + intf.name,
    implements: [intf.id],
    properties: [
      {
        class: 'Proxy',
        of: intf.id,
        name: 'delegate'
      }
    ]
  });

  generateClass(proxy.buildClass());
}

classes.forEach(loadClass(generateClass));
skeletons.forEach(loadClass(generateSkeleton));
proxies.forEach(loadClass(generateProxy));