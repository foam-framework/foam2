/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

process.on('unhandledRejection', function(e) {
  console.error("ERROR: Unhandled promise rejection ", e);
  process.exit(1);
});

// enable FOAM java support.
global.FOAM_FLAGS = { 'java': true, 'debug': true, 'js': false };

require('../src/foam.js');
require('../src/foam/nanos/nanos.js');

var srcPath = __dirname + "/../src/";

if ( ! (process.argv.length == 4 || process.argv.length == 5) ) {
  console.log("USAGE: genjava.js input-path output-path src-path(optional)");
  process.exit(1);
}

if ( process.argv.length == 5 ) {
  srcPath = process.argv[4];
  if ( ! srcPath.endsWith('/') ) {
    srcPath = srcPath + '/';
  }
}

var path_ = require('path');
var fs_ = require('fs');

var indir = process.argv[2];
indir = path_.resolve(path_.normalize(indir));

var externalFile = require(indir);
var classes = externalFile.classes;
var abstractClasses = externalFile.abstractClasses;
var skeletons = externalFile.skeletons;
var proxies = externalFile.proxies;

var blacklist = {}
externalFile.blacklist.forEach(function(cls) {
  blacklist[cls] = true;
});

[
  'FObject',
  'foam.core.AbstractEnum',
  'foam.core.AbstractInterface',
  'foam.core.Property',
  'foam.core.String',
  'foam.core.Validatable',

  // These have hand written java impls so we don't want to clobber them.
  // TODO: Change gen.sh to prefer hand written java files over generated.
  'foam.dao.FilteredDAO',
  'foam.dao.LimitedDAO',
  'foam.dao.OrderedDAO',
  'foam.dao.SkipDAO',

  // TODO: These models currently don't compile in java but could be updated to
  // compile properly.
  'foam.blob.BlobBlob',
  'foam.dao.CompoundDAODecorator',
  'foam.dao.DAODecorator',
  'foam.dao.FlowControl',
  'foam.dao.PromisedDAO',
  'foam.dao.sync.SyncRecord',
  'foam.dao.sync.VersionedSyncRecord',
  'foam.mlang.order.ThenBy',
  'foam.mlang.Expressions',
  'foam.nanos.menu.MenuBar',

  'foam.box.Context',
//  'foam.box.HTTPBox',
//  'foam.box.SessionClientBox',
  'foam.box.SocketBox',
  'foam.box.WebSocketBox',
  'foam.box.TimeoutBox',
  'foam.box.RetryBox',
  'foam.dao.CachingDAO',
  'foam.dao.CompoundDAODecorator',
  'foam.dao.DecoratedDAO',
  'foam.dao.DeDupDAO',
  'foam.dao.IDBDAO',
  'foam.dao.JDAO',
  'foam.dao.LoggingDAO',
  'foam.dao.MDAO',
  'foam.dao.PromisedDAO',
  'foam.dao.RequestResponseClientDAO',
  'foam.dao.SyncDAO',
  'foam.dao.TimingDAO'
].forEach(function(cls) {
  blacklist[cls] = true;
});

var outdir = process.argv[3];
outdir = path_.resolve(path_.normalize(outdir));

function ensurePath(p) {
  var i = 1 ;
  var parts = p.split(path_.sep);
  var path = '/' + parts[0];

  while ( i < parts.length ) {
    try {
      var stat = fs_.statSync(path);
      if ( ! stat.isDirectory() ) throw path + 'is not a directory';
    } catch(e) {
      fs_.mkdirSync(path);
    }

    path += path_.sep + parts[i++];
  }
}

function loadClass(c) {
  var path = srcPath;

  if ( foam.Array.isInstance(c) ) {
    path = path + c[0];
    c = c[1];
  }
  if ( ! foam.lookup(c, true) ) require(path + c.replace(/\./g, '/') + '.js');
  return foam.lookup(c);
}

function generateClass(cls) {
  if ( foam.Array.isInstance(cls) ) {
    cls = cls[1];
  }
  if ( typeof cls === 'string' )
    cls = foam.lookup(cls);

  var outfile = outdir + path_.sep +
    cls.id.replace(/\./g, path_.sep) + '.java';

  ensurePath(outfile);

  writeFileIfUpdated(outfile, cls.buildJavaClass().toJavaSource());
}

function generateAbstractClass(cls) {
  if ( foam.Array.isInstance(cls) ) {
    cls = cls[1];
  }
  cls = foam.lookup(cls);

  var outfile = outdir + path_.sep +
    cls.id.replace(/\./g, path_.sep) + '.java';

  ensurePath(outfile);

  var javaclass = cls.buildJavaClass(foam.java.Class.create({ abstract: true }));

  writeFileIfUpdated(outfile, javaclass.toJavaSource());
}

function generateSkeleton(cls) {
  if ( foam.Array.isInstance(cls) ) {
    cls = cls[1];
  }
  cls = foam.lookup(cls);

  var outfile = outdir + path_.sep +
    cls.package.replace(/\./g, path_.sep) +
    path_.sep + cls.name + 'Skeleton.java';

  ensurePath(outfile);

  writeFileIfUpdated(outfile, foam.java.Skeleton.create({ of: cls }).buildJavaClass().toJavaSource());
}

function generateProxy(intf) {
  if ( foam.Array.isInstance(intf) ) {
    intf = intf[1];
  }
  intf = foam.lookup(intf);

  var existing = foam.lookup(intf.package + '.Proxy' + intf.name, true);

  if ( existing ) {
    generateClass(existing.id);
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

function copyJavaClassesToBuildFolder(startPath) {
  var files = fs_.readdirSync(startPath);
  var result = [];

  files.forEach(function (f) {
    var filePath = path_.join(startPath, f);
    var fileStat = fs_.statSync(filePath);
    var outputPath = path_.join(__dirname, '../build/', filePath.split('src/').pop());

    if (fileStat.isDirectory()) {
      if (!fs_.existsSync(outputPath)) {
        fs_.mkdirSync(outputPath);
      }

      result = result.concat(copyJavaClassesToBuildFolder(filePath));
    } else if (f.search('.js') < 0) {
      writeFileIfUpdated(outputPath, fs_.readFileSync(filePath).toString(), result);
    }
  });

  return result;
}

function writeFileIfUpdated(outfile, buildJavaSource, opt_result) {
  if (! ( fs_.existsSync(outfile) && (fs_.readFileSync(outfile).toString() == buildJavaSource))) {
    fs_.writeFileSync(outfile, buildJavaSource);
    if ( opt_result !== undefined) opt_result.push(outfile);
  }
}

var addDepsToClasses = function() {

  // Determine all of the paths that the modelDAO should search will use when
  // arequiring all of the classes.
  var paths = {};
  paths[srcPath] = true;
  classes.forEach(function(cls) {
    if ( foam.Array.isInstance(cls) ) paths[srcPath + cls[0]] = true;
  });

  // Remove the paths from the entries in classes because the modelDAO should be
  // able to find them now.
  classes = classes.map(function(cls) {
    return foam.Array.isInstance(cls) ? cls[1] : cls;
  });

  var flagFilter = foam.util.flagFilter(['java']);

  var classloader = foam.__context__.classloader;
  Object.keys(paths).forEach(function(p) {
    classloader.addClassPath(p);
  });

  return Promise.all(classes.map(function(cls) {
    return classloader.load(cls);
  })).then(function() {
    var classMap = {};
    var classQueue = classes.slice(0);
    while ( classQueue.length ) {
      var cls = classQueue.pop();
      if ( ! classMap[cls] && ! blacklist[cls] ) {
        classMap[cls] = true;
        cls = foam.lookup(cls);
        cls.getAxiomsByClass(foam.core.Requires).filter(flagFilter).forEach(function(r) {
          r.javaPath && classQueue.push(r.javaPath);
        });
        cls.getAxiomsByClass(foam.core.Implements).filter(flagFilter).forEach(function(r) {
          classQueue.push(r.path);
        });
        if ( cls.model_.extends ) classQueue.push(cls.model_.extends);
      }
    }
    classes = Object.keys(classMap);
  });
};

addDepsToClasses().then(function() {
  classes.forEach(loadClass);
  abstractClasses.forEach(loadClass);
  skeletons.forEach(loadClass);
  proxies.forEach(loadClass);

  classes.forEach(generateClass);
  abstractClasses.forEach(generateAbstractClass);
  skeletons.forEach(generateSkeleton);
  proxies.forEach(generateProxy);

  var srcFolder = path_.join(__dirname, '../src/');

  copyJavaClassesToBuildFolder(srcFolder);
});
