/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  name: 'DirTreeHandler',
  extends: 'foam.net.node.PathnamePrefixHandler',
  flags: ['node'],
  documentation: `HTTP(S) server handler for an entire directory.

      All files in the directory will be served according to their relative
      path name.

      E.g.,

      /foo/bar
      /foo/bar/baz
      /foo/bar/baz/alpha.html
      /foo/bar/quz/beta.js
      /foo/bar/quz/charlie.xyz

     Suppose dir=/foo/bar and pathnamePrefix=/frobinator

     This exposes URLs (relative to the server's root):

     /frobinator/baz/alpha.html as an html document
     /frobinator/quz/beta.js as a client-runnable script
     /frobinator/quz/charlie.xyz as a document resource`,

  imports: [
    'log',
    'info'
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
      transient: true,
      factory: function() { return require('path'); },
      cloneProperty: function() {}
    },
    {
      name: 'fs',
      transient: true,
      factory: function() { return require('fs'); },
      cloneProperty: function() {}
    }
  ],

  methods: [
    function handle(req, res) {
      // Try to serve a static file.
      if ( ! this.dir ) return false;

      // Check the URL for the prefix.
      var target = req.url.pathname;
      if ( target.indexOf(this.pathnamePrefix) !== 0 ) {
        this.send404(req, res);
        this.reportWarnMsg(req, `PathnamePrefix Route/Handler mismatch:
                                    URL pathname: ${req.url.pathname}
                                    Handler prefix: ${this.pathnamePrefix}`);
        return true;
      }

      target = target.substring(this.pathnamePrefix.length);

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
        this.reportWarnMsg(
          req, 'Attempt to read static file outside directory: ' + target);
        return true;
      }

      // Now we have a legal filename within our subdirectory.
      // We try to stream the file to the other end.
      if ( ! this.fs.existsSync(target) ) {
        this.send404(req, res);
        this.reportWarnMsg(req, 'File not found: ' + target);
        return true;
      }

      var stats = this.fs.statSync(target);
      if ( stats.isDirectory() ) {
        this.send404(req, res);
        this.reportWarnMsg(req, 'Attempt to read directory: ' + target);
        return true;
      }

      var ext = this.path.extname(target);
      var mimetype = this.mimeTypes[ext] || this.mimeTypes.__default;
      if ( mimetype === this.mimeTypes.__default ) {
        this.info('Unknown MIME type: ' + ext);
      }
      res.setStatusCode(200);
      res.setHeader('Content-type', mimetype);

      // Stream file.
      res.pipeFrom(this.fs.createReadStream(target));
      this.info('200 OK ' + req.url.pathname + ' => ' + target);

      return true;
    }
  ]
});
