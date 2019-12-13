/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foamlink',
  name: 'FoamlinkExec',
  documentation: `
    FoamlinkExec checks for foamlink.js in the current directory, then
    begins following the instructions to produce an instance of
    FoamlinkData.
  `,
  properties: [
    ['repositories_', {}],
    ['ignorePaths_', {}],
    ['injectFiles_', {}],
    ['reservedNames_', [
      'files.js', 'files2.js', 'classes.js'
    ]],
    {
      name: 'results',
      class: 'FObjectProperty',
      factory: function() {
        return foam.foamlink.FoamlinkData.create();
      }
    }
  ],
  methods: [
    function init() {
      this.nodejs_ = {};
      this.require_('path');
      this.require_('fs');
    },
    function require_(name, asName) {
      Object.defineProperty(this.nodejs_, asName || name, {
        value: require(name),
        writable: false
      });
    },
    function exec(path) {
      var self = this;
      path = path || process.cwd();

      return new Promise((resolve, reject) => {
        this.processFoamlinkFile(path, true);

        Promise.all(Object.keys(this.repositories_).map(
            repoPath => this.startWalking(repoPath, reject))
          ).then(resolve);
      });
    },
    function startWalking(repoPath, reject) {
      var self = this;

      try {
        this.processFoamlinkFile(repoPath, false, true);
      } catch (e) {
        reject(e);
      }

      var walker = foam.util.filesystem.FileWalker.create();
      walker.files.sub((_1, _2, info) => {
        try {
          self.handleDirectory(repoPath, info);
        } catch (e) {
          console.error(e);
          reject(e);
        }
      });
      return walker.walk(repoPath);
    },
    function handleDirectory(repoPath, info) { // throws io
      // These will be removed when a logger is used
      var tag = "\033[36;1m<<<FOAMLINK>>>\033[0m ";
      var g = (s) => "\033[32;1m" + s + "\033[0m ";
      var w = "\033[33;1m[WARN]\033[0m ";

      for ( k in this.ignorePaths_ ) {
        if ( info.directory === k || info.directory.startsWith(k + '/') )
          return;
      }

      var relPath = this.nodejs_.path.relative(repoPath, info.directory);

      // Compute expected package name for warnings
      var expectedPackage = relPath.replace(/[\\/]/g, '.');

      // Run the foamlink file if it exists
      this.processFoamlinkFile(info.directory, false, false);

      for ( name in info.files ) {
        let fileInfo = info.files[name];
        
        if ( // These are the conditions in which a file is skipped
          fileInfo.name === 'foamlink.js'
          || ! fileInfo.name.endsWith('.js')
          || this.reservedNames_.includes(fileInfo.name)
          || this.ignorePaths_[fileInfo.fullPath]
        ) continue;

        let text = this.nodejs_.fs.readFileSync(fileInfo.fullPath)
        text = text.toString();

        // Add any code specified by 'INJECT' in a foamlink file
        if ( this.injectFiles_[fileInfo.fullPath] ) {
          injectCode = this.injectFiles_[fileInfo.fullPath].join('\n') + '\n';
          text = injectCode + text;
        }

        let idsPresent = null;
        try {
          idsPresent = foam.foamlink.lib.processSourceForMeta(text);
        } catch (e) {
          e.message = 'Error processing <'+fileInfo.fullPath+'>: ' + e.message;
          throw e;
        }

        for ( id in idsPresent ) {
          if (
            !(id === expectedPackage || id.startsWith(expectedPackage+'.'))
          ) {
            console.warn(tag + w +
              'Package name does not match file path: ' +
              '"' + id + '" is outside of "' + expectedPackage + '".'
            );
          }
        }

        this.results.add(fileInfo.fullPath, idsPresent);
      }
    },
    function processFoamlinkFile(path, required, encouraged) {
      // These will be removed when a logger is used
      var tag = "\033[36;1m<<<FOAMLINK>>>\033[0m ";
      var g = (s) => "\033[32;1m" + s + "\033[0m ";
      var w = "\033[33;1m[WARN]\033[0m ";

      var self = this;

      // The expanse of code that reads the file

      filePath = this.nodejs_.path.join(path, 'foamlink.js');
      try {
        this.nodejs_.fs.lstatSync(filePath);
      } catch (e) {
        if ( required ) {
          throw new Error('unable to open foamlink.js in ' + path, e);
        }
        if ( encouraged ) {
          console.warn(tag + w +
            'No foamlink.js file; using default settings: ' + path);
        }
        return false;
      }
      var text = null;
      try {
        text = this.nodejs_.fs.readFileSync(filePath);
        text = text.toString();
      } catch (e) {
        throw e;
      }

      // The expanse of code that processes the file

      var foamlinkFileInfo = {
        version: '0.0.0'
      };

      // TODO: this __foamlink__ object can probably be modelled
      var __foamlink__ = {};
      __foamlink__.RUNNING_IN_FOAMLINK = true;
      __foamlink__.REPO = function(repoPath) {
        console.log(tag + g('[REPOSITORY]') + repoPath);
        let fullPath = self.nodejs_.path.join(path, repoPath);
        self.repositories_[fullPath] = {};
      }
      __foamlink__.ABORT = function(msg) {
        throw new Error(msg);
      }
      __foamlink__.VERSION = function(v) {
        if ( typeof v !== 'string' ) {
          throw new Error('foamlink version must be string');
        }
        foamlinkFileInfo.version = v;
      }
      __foamlink__.IGNORE = function(ignorePath) {
        let fullPath = self.nodejs_.path.join(path, ignorePath);
        self.ignorePaths_[fullPath] = {};
      }
      // Alias for IGNORE; use to indicate something is broken
      __foamlink__.BROKEN = __foamlink__.IGNORE;
      __foamlink__.INJECT = function(injectFile, code) {
        let fullPath = self.nodejs_.path.join(path, injectFile);
        if ( self.injectFiles_[fullPath] ) {
          self.injectFiles_[fullPath].push(code);
        } else {
          self.injectFiles_[fullPath] = [code];
        }
      }
      __foamlink__.MANUAL = function(filePath, classes) {
        let fullPath = self.nodejs_.path.join(path, filePath);
        // This is the sad part of foamlink for when a file can't be processed
        self.results.add(fullPath, classes);
        self.ignorePaths_[fullPath] = {}
      }
      __foamlink__.ROOTS = function() {
        for ( var i = 0; i < arguments.length; i++ ) {
          foam.foamlink.lib.addRoot(arguments[i]);
        }
      }

      // Process the foamlink.js file
      with ( __foamlink__ ) { eval(text); }
    }
  ]
});
