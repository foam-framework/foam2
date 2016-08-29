require('../src/foam.js');
//require('../src/lib/java.js');

if ( process.argv.length !== 4 ) {
  console.log("USAGE: genjava.js output-path class-names");
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

var args = process.argv[3].split(',');


for ( var i = 0 ; i < args.length ; i++ ) {
  if ( ! foam.lookup(args[i], true) ) require('../src/' + args[i].replace(/\./g, '/') + '.js');

  var cls = foam.lookup(args[i]);

  var outfile = outdir + require('path').sep + cls.id.replace(/\./g, require('path').sep) + '.java';

  ensurePath(outfile);
  require('fs').writeFileSync(outfile, cls.javaSource());
}
