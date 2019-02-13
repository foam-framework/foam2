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
  name: 'Server',
  flags: ['node'],
  documentation: `An modeled HTTP server implementation.

      The server stores a Router, which is responsible for handling requests to
      routes. The server starts listening on its "port" when start() is invoked.
      Listening ceases on shutdown().`,

  requires: [
    'foam.net.node.EntityEncoding',
    'foam.net.node.ErrorHandler',
    'foam.net.node.ServerRequest',
    'foam.net.node.SimpleRouter',
    'foam.net.node.SimpleServerResponse'
  ],

  imports: [
    'creationContext? as creationContextFromCtx',
    'defaultEntityEncoding? as ctxDefaultEntityEncoding',
    'entityEncodings? as ctxEntityEncodings',
    'info',
    'log',
    'error'
  ],
  exports: [
    'creationContext',
    'defaultEntityEncoding',
    'entityEncodings'
  ],

  constants: {
    DEFAULT_ENTITY_ENCODINGS: [
      foam.net.node.EntityEncoding.create({
        bufferEncoding: 'ascii',
        charsetRegExp: /^(US-ASCII|us|IBM367|cp367|csASCII|iso-ir-100|ISO_8859-1|ISO-8859-1)$/i
      }),
      foam.net.node.EntityEncoding.create({
        bufferEncoding: 'utf8',
        charsetRegExp: /UTF-8/i
      }),
      foam.net.node.EntityEncoding.create({
        bufferEncoding: 'utf16le',
        charsetRegExp: /^UTF-16LE$/i
      }),
      foam.net.node.EntityEncoding.create({
        bufferEncoding: 'ucs2',
        charsetRegExp: /^$ISO-10646-UCS-2/i
      })
    ],
    DEFAULT_DEFAULT_ENTITY_ENCODING: foam.net.node.EntityEncoding.create({
      bufferEncoding: 'ascii',
      charsetRegExp: /^(US-ASCII|us|IBM367|cp367|csASCII|iso-ir-100|ISO_8859-1|ISO-8859-1)$/i
    }),
  },

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.net.node.Handler',
      name: 'handler',
      factory: function() { return this.SimpleRouter.create(); }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.net.node.Handler',
      name: 'errorHandler',
      factory: function() {
        return this.ErrorHandler.create({
          logMessage: 'Server.handler failed to handle request',
          httpCode: 404
        });
      }
    },
    {
      class: 'Int',
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
      documentation: 'The Node JS http.Server object.',
      value: null
    },
    {
      name: 'http',
      factory: function() { return require('http'); }
    },
    {
      name: 'defaultEntityEncoding',
      factory: function() {
        return this.ctxDefaultEntityEncoding ||
            this.DEFAULT_DEFAULT_ENTITY_ENCODING;
      },
    },
    {
      name: 'entityEncodings',
      factory: function() {
        return this.ctxEntityEncoding ||
            this.DEFAULT_ENTITY_ENCODINGS;
      },
    },
  ],

  methods: [
    function start() {
      if ( this.server ) return Promise.resolve(this.server);

      this.validate();

      this.server = this.http.createServer(this.onRequest);

      var self = this;
      return new Promise(function(resolve, reject) {
        self.server.listen(self.port, function() {
          self.info('Listening on port ' + self.port + '\n' +
                    foam.json.Pretty.stringify(self.handler));
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
    function onRequest(nodeReq, nodeRes) {
      var req = this.ServerRequest.create({
        msg: nodeReq
      });
      var res = this.SimpleServerResponse.create({
        res: nodeRes
      });
      var handled = this.handler.handle(req, res);

      if ( ! handled ) {
        handled = this.errorHandler.handle(req, res);
        if ( ! handled ) {
          this.error(`foam.net.node.Server:
                         Handler + error handler failed to handle request:
                         ${nodeReq.url}`);
        }
      }
    }
  ]
});
