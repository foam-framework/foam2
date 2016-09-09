require('../src/foam.js');

if ( process.argv.length < 4 ) {
  console.log("USAGE: genjava.js output-path class-names skeletons");
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

var classes = process.argv[3].split(',');
var skeletons = process.argv[4].split(',');


var args = classes;
for ( var i = 0 ; i < args.length ; i++ ) {
  if ( ! foam.lookup(args[i], true) ) require('../src/' + args[i].replace(/\./g, '/') + '.js');

  var cls = foam.lookup(args[i]);

  var outfile = outdir + require('path').sep + cls.id.replace(/\./g, require('path').sep) + '.java';

  ensurePath(outfile);
  require('fs').writeFileSync(outfile, cls.javaSource());
}

args = skeletons;
for ( var i = 0 ; i < args.length ; i++ ) {
  if ( ! foam.lookup(args[i], true) ) require('../src/' + args[i].replace(/\./g, '/') + '.js');

  var cls = foam.lookup(args[i]);

  var outfile = outdir + require('path').sep + cls.package.replace(/\./g, require('path').sep) +
    require('path').sep +
    cls.name + 'Skeleton.java';

  ensurePath(outfile);
  var output = foam.java.Outputter.create();
  output.out(foam.java.Skeleton.create({
    of: args[i]
  }).buildJavaClass());
  require('fs').writeFileSync(outfile, output.buf_);
}
