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
  name: 'Server',

  documentation: `An modeled HTTP server implementation.

      The server stores an array of "handlers" for handling
      requests. Handlers are given the chance to handle requests in the order
      they appear in the array. The server starts listening on its "port"
      when start() is invoked. Listening ceases on shutdown().`,

  requires: [
    'foam.dao.ArrayDAO',
    'foam.node.handlers.FileHandler',
    'foam.node.handlers.RestDAOHandler',
    'foam.node.handlers.StaticFileHandler'
  ],

  imports: [
    'info',
    'log'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.net.node.Handler',
      name: 'handlers'
    },
    {
      type: 'Int',
      name: 'port',
      value: 8000
    },
    {
      name: 'server',
      documentation: 'The Node JS HTTP Server object.',
      value: null
    },
    {
      name: 'http',
      factory: function() { return require('http'); }
    }
  ],
  methods: [
    function start() {
      if ( this.server ) return Promise.resolve(this.server);

      this.server = this.http.createServer(this.onRequest);

      var self = this;
      return new Promise(function(resolve, reject) {
        self.server.listen(self.port, function() {
        self.info(
          self.handlers.length + ' handlers listening on port ' + self.port);
          resolve(self.server);
        });
      });
    },
    function shutdown() {
      if ( ! this.server ) return Promise.resolve(null);

      var self = this;
      return new Promise(function(resolve, reject) {
        self.server.close(function() {
          self.server = null;
          resolve(null);
        });
      });
    },
    function addHandler(handler) {
      this.handlers.push(handler);
    },
    function exportDAO(dao, urlPath) {
      this.addHandler(this.RestDAOHandler.create({
        dao: dao,
        urlPath: urlPath
      }));

      this.log('Export DAO to ' + urlPath);
    },
    function exportFile(urlPath, filePath) {
      this.handlers.push(this.FileHandler.create({
        urlPath: urlPath,
        filePath: filePath
      }));

      this.log('Export File ' + filePath + ' to ' + urlPath);
    },
    function exportDirectory(urlPath, dir) {
      this.handlers.push(
        this.StaticFileHandler.create({
          dir: dir,
          urlPath: urlPath
        }));

      this.log('Export directory ' + dir + ' to ' + urlPath);
    }
  ],

  listeners: [
    function onRequest(req, res) {
      for ( var i = 0 ; i < this.handlers.length ; i++ ) {
        if ( this.handlers[i].handle(req, res) ) break;
      }
      if ( i === this.handlers.length ) {
        res.statusCode = 404;
        res.write('File not found: ' + req.url, 'utf8');
        res.end();
      }
    }
  ]
});
