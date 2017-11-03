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
  name: 'FileHandler',
  extends: 'foam.net.node.PathnamePrefixHandler',

  documentation: 'HTTP(S) server handler for a single file.',

  imports: [ 'info' ],

  properties: [
    {
      class: 'String',
      name: 'filePath',
      documentation: 'File location.',
      required: true
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
      name: 'fs',
      transient: true,
      factory: function() { return require('fs'); }
    },
    {
      name: 'path',
      transient: true,
      factory: function() { return require('path'); }
    }
  ],

  methods: [
    function handle(req, res) {
      if ( req.url.pathname.indexOf(this.pathnamePrefix) !== 0 ) {
        this.send404(req, res);
        this.reportWarnMsg(req, `PathnamePrefix Route/Handler mismatch:
                                    URL pathname: ${req.url.pathname}
                                    Handler prefix: ${this.pathnamePrefix}`);
        return true;
      }

      // Ensure that file exists.
      if ( ! this.fs.existsSync(this.filePath) ) {
        this.send404(req, res);
        this.reportWarnMsg(req, 'File not found: ' + this.filePath);
        return true;
      }

      // Ensure that file is not a directory.
      var stats = this.fs.statSync(this.filePath);
      if ( stats.isDirectory() ) {
        this.send404(req, res);
        this.reportWarnMsg(req, 'Attempt to read directory: ' + this.filePath);
        return true;
      }

      // Lookup mime type and set header accordingly.
      var ext = this.path.extname(this.filePath);
      var mimetype = this.mimeTypes[ext] || this.mimeTypes.__default;
      res.statusCode = 200;
      res.setHeader('Content-type', mimetype);

      res.pipeFrom(this.fs.createReadStream(this.filePath));
      this.info('200 OK ' + this.pathnamePrefix + ' => ' + this.filePath);

      return true;
    }
  ]
});
