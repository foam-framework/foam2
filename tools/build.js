

var flags = {};

if ( process.argv.length > 2 ) {
  process.argv[2].split(',').forEach(function(f) {
    flags[f] = true;
  });
}

var env = {
  FOAM_FILES: function(files) {
    var payload = '';

    files.filter(function(f) {
      return f.flags ? flags[f.flags] : true;
    }).map(function(f) {
      return f.name;
    }).forEach(function(f) {
      var data = require('fs').readFileSync(__dirname + '/../src/' + f + '.js').toString();
      payload += data;
    });

    require('fs').writeFileSync(__dirname + '/../foam-bin.js', payload);
  }
};

var data = require('fs').readFileSync(__dirname + '/../src/files.js');

with (env) { eval(data.toString()); }
