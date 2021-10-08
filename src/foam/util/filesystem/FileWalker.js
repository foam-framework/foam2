/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.filesystem',
  name: 'FileWalker',

  topics: ['files', 'directoryStart', 'directoryEnd', 'error'],

  documentation: `
    This FileWalker goes through items in a directory recursively
    and reports the following to these 4 topics:
    - files: An object with information about the files in a directory.
        For example:
          { directory: 'foam3/src/foam/model',
            files: {
              "Model.js": {/* lstat object */} } }
    - directoryStart: the path of a directory being walked
    - directoryEnd: the path of a directory done being walked
    - error: this topic reports two arguments to the listener:
        the source of the error as a string (ex: 'lstat') and the
        error object.
  `,

  properties: [
    // TODO: add regexes for ignored files (ex: dotfiles)
    {
      name: 'order',
      value: 'BFS',
      documentation: `
        Order of FileWalker; either BFS for breadth-first search,
        or DFS for depth-first-search.

        Note that for DFS the FileWalker still must stat all the files
        in a directory before it can move deeper.
      `
    },
    'nodejs_'
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
    function walk(path, depth) {
      if ( typeof depth === 'undefined' ) {
        depth = 0;
      }

      var self = this;
      return new Promise(function(resolve, reject) {
        self.nodejs_.fs.readdir(path, function(err, files) {
          if ( err ) {
            reject(err);
            return;
          }

          filesMessage = {
            directory: path,
            files: {}
          };
          directoriesToWalk = [];

          let fileInfos = files
            .map((file) => {
              let fullPath = self.nodejs_.path.join(path, file);
              try {
                stats = self.nodejs_.fs.lstatSync(fullPath);
                return {
                  name: file,
                  fullPath: fullPath,
                  stats: stats,
                }
              } catch (e) {
                console.warn('Failed to stat file: ' + fullPath);
                self.error.pub('stat', e);
              }
              return null;
            }).filter( (info) => info !== null );

          directoriesToWalk = fileInfos
            .filter( (info) => info.stats.isDirectory() )
            .map( (info) => info.fullPath );

          filesMessage.files = fileInfos
            .filter( (info) => ! info.stats.isDirectory() );

          let recursePromises = [];
          switch ( self.order ) {
          case 'BFS':
            self.directoryStart.pub(path);
            self.files.pub(filesMessage);
            Promise.all(directoriesToWalk.map(
              (fullPath) => self.walk(fullPath, depth + 1)
            )).then(() => {
              self.directoryEnd.pub(path);
              resolve();
            });
            break;
          case 'DFS':
            self.directoryStart.pub(path);
            Promise.all(directoriesToWalk.map(
              (fullPath) => self.walk(fullPath, depth + 1)
            )).then(() => {
              self.files.pub(filesMessage);
              self.directoryEnd.pub(path);
              resolve();
            });
            break;
          }

        });
      })
    }
  ]
});
