/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.net.node',
  name: 'StaticFileHandler',
  extends: 'foam.net.node.Handler',

  imports: [
    'log',
    'info',
    'warn'
  ],

  properties: [
    {
      class: 'String',
      name: 'dir',
      documentation: 'Directory under which to serve files.',
      preSet: function(old, nu) {
        return this.path.resolve(process.cwd(), nu);
      },
      factory: function() { return process.cwd(); }
    },
    {
      class: 'String',
      name: 'urlPath',
      documentation: 'URL path prefix. Stripped before searching "dir".'
    },
    {
      name: 'mimeTypes',
      factory: function() {
        return {
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.html': 'text/html',
          __default: 'application/octet-stream'
        };
      }
    },
    {
      name: 'path',
      factory: function() { return require('path'); }
    },
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    }
  ],

  methods: [
    function handle(req, res) {
      // Try to serve a static file.
      if ( ! this.dir ) return false;

      // Check the URL for the prefix.
      var target = req.url;
      if ( target.indexOf(this.urlPath) !== 0 ) return false;

      target = target.substring(this.urlPath.length);

      // Check and strip the prefix off the URL.
      if ( target.indexOf('?') >= 0 )
        target = target.substring(0, target.indexOf('?'));
      if ( target.indexOf('#') >= 0 )
        target = target.substring(0, target.indexOf('#'));

      this.log('Matched prefix, target file: ' + target);

      // String a leading slash, if any.
      if ( target[0] === '/' ) target = target.substring(1);

      target = this.path.resolve(this.dir, target);
      this.log('Target resolved to: ' + target);
      var rel = this.path.relative(this.dir, target);
      this.log('Relative path: ' + target);

      // The relative path can't start with .. or it's outside the dir.
      if ( rel.startsWith('..') ) {
        this.send404(req, res);
        this.warn('Attempt to read static file outside directory: ' + target);
        return true;
      }

      // Now we have a legal filename within our subdirectory.
      // We try to stream the file to the other end.
      if ( ! this.fs.existsSync(target) ) {
        this.send404(req, res);
        this.warn('File not found: ' + target);
        return true;
      }

      var stats = this.fs.statSync(target);
      if ( stats.isDirectory() ) {
        this.send404(req, res);
        this.warn('Attempt to read directory: ' + target);
        return true;
      }

      var ext = this.path.extname(target);
      var mimetype = this.mimeTypes[ext] || this.mimeTypes.__default;
      if ( mimetype === this.mimeTypes.__default ) {
        this.info('Unknown MIME type: ' + ext);
      }
      res.statusCode = 200;
      res.setHeader('Content-type', mimetype);

      // Open the file as a stream.
      var stream = this.fs.createReadStream(target);
      stream.pipe(res);
      this.info('200 OK ' + target);

      return true;
    }
  ]
});
