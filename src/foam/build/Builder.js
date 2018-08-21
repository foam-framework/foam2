/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'Builder',
  requires: [
    'foam.build.DirWriter',
    'foam.build.FilesJsGen',
  ],
  constants: [
    {
      name: 'BOOT_FILES',
      value: [
        'foam.js',
        'foam/core/poly.js',
        'foam/core/lib.js',
      ],
    },
  ],
  properties: [
    {
      name: 'srcDirs',
      factory: function() {
        return [global.FOAM_ROOT]
      },
    },
    {
      name: 'outDir',
      value: 'STRIPPED/src',
    },
    {
      name: 'flags',
      value: ['js', 'web', 'debug'],
    },
    {
      name: 'required',
      factory: function() { return this.FilesJsGen.NANOS_MODELS },
    },
  ],
  methods: [
    function execute() {
      var self = this;

      // Clear the destination dir and copy all non-js files to it from the
      // srcDirs.
      var cp = require('child_process');
      cp.execSync('rm -rf ' + self.outDir)
      cp.execSync('mkdir -p ' + self.outDir)
      self.srcDirs.forEach(function(srcDir) {
        cp.execSync(`rsync -a --exclude='*.js' ${srcDir}/ ${self.outDir}/`)
      })

      Promise.all(self.srcDirs.map(function(srcDir) {
        return self.DirWriter.create({
          flags: self.flags,
          srcDir: srcDir,
          outDir: self.outDir,
        }).execute();
      })).then(function() {
        return self.FilesJsGen.create({
          required: self.required,
          srcDir: self.outDir,
        }).getFilesJs()
      }).then(function(filesJs) {
        // Write files.js and copy boot files to destDir.
        var sep = require('path').sep;
        var fs = require('fs');
        fs.writeFileSync(self.outDir + sep + 'files.js', filesJs, 'utf8');
        self.BOOT_FILES.forEach(function(f) {
          fs.writeFileSync(
            self.outDir + sep + f,
            fs.readFileSync(global.FOAM_ROOT + sep + f, 'utf-8'),
            'utf-8')
        });

        // Concat all files.js into foam-bin.js. Prepend it with an exerpt from
        // foam.js that sets up FOAM_ROOT because that's needed by the
        // ClassLoaderContextScript which is essential for loading classes.
        var foamBin = [`
var path = document.currentScript && document.currentScript.src;

// document.currentScript isn't supported on all browsers, so the following
// hack gets the job done on those browsers.
if ( ! path ) {
  var scripts = document.getElementsByTagName('script');
  for ( var i = 0 ; i < scripts.length ; i++ ) {
    if ( scripts[i].src.match(/\\/foam-bin.js$/) ) {
      path = scripts[i].src;
      break;
    }
  }
}

path = path.substring(0, path.lastIndexOf('src/')+4);
window.FOAM_ROOT = path;
        `];
        var env = {
          FOAM_FILES: function(files) {
            files.forEach(function(f) {
              foamBin.push(fs.readFileSync(self.outDir + sep + f.name + '.js').toString());
            })
          }
        }
        with (env) { eval(filesJs) }
        fs.writeFileSync(
          self.outDir + sep + '/foam-bin.js',
          foamBin.join('\n'),
          'utf-8')
      });
    },
  ],
});

