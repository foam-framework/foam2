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

      The server stores a Router, which is responsible for handling requests to
      routes. The server starts listening on its "port" when start() is invoked.
      Listening ceases on shutdown().`,

  requires: [
    'foam.dao.ArrayDAO',
    'foam.net.node.PrefixRouter',
  ],

  imports: [
    'creationContext? as creationContextFromCtx',
    'info',
    'log'
  ],
  exports: [ 'creationContext' ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.net.node.Router',
      name: 'router',
      required: true
    },
    {
      type: 'Int',
      name: 'port',
      value: 8000
    },
    {
      name: 'creationContext',
      factory: function() {
        return this.creationContextFromCtx || this.__subContext__;
      }
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

      this.validate();

      this.server = this.http.createServer(this.onRequest);

      var self = this;
      return new Promise(function(resolve, reject) {
        self.server.listen(self.port, function() {
          self.info(this.router + ' listening on port ' + self.port);
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
    }
  ],

  listeners: [
    function onRequest(req, res) {
      this.router.onRequest(req, res);
    }
  ]
});
