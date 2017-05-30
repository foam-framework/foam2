/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// enable FOAM java support.
global.FOAM_FLAGS = { 'java': true, 'debug': true, 'js': false };

require('../src/foam.js');
require('../src/foam/nanos/nanos.js');

if ( process.argv.length != 4 ) {
  console.log("USAGE: genjava.js input-path output-path");
  process.exit(1);
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
  if ( ! foam.lookup(c, true) ) require('../src/' + c.replace(/\./g, '/') + '.js');
  return foam.lookup(c);
}

function generateClass(cls) {
  if ( typeof cls === 'string' )
    cls = foam.lookup(cls);

  var outfile = outdir + path_.sep +
    cls.id.replace(/\./g, path_.sep) + '.java';

  ensurePath(outfile);

  fs_.writeFileSync(outfile, cls.buildJavaClass().toJavaSource());
}

function generateAbstractClass(cls) {
  cls = foam.lookup(cls);

  var outfile = outdir + path_.sep +
    cls.id.replace(/\./g, path_.sep) + '.java';

  ensurePath(outfile);

  var javaclass = cls.buildJavaClass();
  javaclass.abstract = true;

  fs_.writeFileSync(outfile, javaclass.toJavaSource());
}

function generateSkeleton(cls) {
  cls = foam.lookup(cls);

  var outfile = outdir + path_.sep +
    cls.package.replace(/\./g, path_.sep) +
    path_.sep + cls.name + 'Skeleton.java';

  ensurePath(outfile);

  fs_.writeFileSync(
    outfile,
    foam.java.Skeleton.create({ of: cls }).buildJavaClass().toJavaSource());
}

function generateProxy(intf) {
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
    } else {
      fs_.writeFileSync(outputPath, fs_.readFileSync(filePath));
      result.push(outputPath);

      console.log(outputPath);
    }
  });

  return result;
}

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
