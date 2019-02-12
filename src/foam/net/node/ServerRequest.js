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
  name: 'ServerRequest',
  flags: ['node'],
  documentation: `Request recieved by HTTP server. Underlying Node JS message
      should be injected upon creation but treated as private.`,

  requires: [
    'foam.net.node.EntityEncoding'
  ],
  imports: [
    'defaultEntityEncoding',
    'entityEncodings'
  ],

  properties: [
    {
      name: 'method',
      getter: function() { return this.msg.method; }
    },
    {
      name: 'urlString',
      getter: function() { return this.msg.url; }
    },
    {
      name: 'url',
      getter: function() { return this.parseURL_(this.urlString); }
    },
    {
      name: 'headers',
      getter: function() { return this.msg.headers; }
    },
    {
      name: 'remoteAddress',
      getter: function() { return this.msg.socket.remoteAddress; }
    },
    {
      name: 'payload',
      documentation: 'A promise for the request body.',
      value: null
    },
    {
      name: 'msg',
      documentation: 'Node JS http.IncomingMessage associated with request.',
      required: true,
      final: true
    },
    {
      class: 'String',
      name: 'payloadEncoding_',
      documentation: 'The encoding used for the request payload.',
    },
    {
      name: 'urlLib_',
      factory: function() { return require('url'); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.validate();

      this.deducePayloadEncodingFromContentEncoding_(
          this.headers['Content-Encoding']);

      var self = this;
      this.payload = new Promise(function(resolve, reject) {
        var buf = new Buffer('');
        var done = false;

        self.msg.on('data', function(chunk) {
          if ( Buffer.isBuffer(chunk) ) {
            buf = Buffer.concat([buf, chunk]);
          } else {
            buf = Buffer.concat([buf, this.payloadStrToBuf_(chunk)]);
          }
        });
        self.msg.on('end', function() {
          done = true;
          resolve(buf);
        });

        // TODO(markdittmer): Better error reporting.
        function maybeError(error) {
          if ( done ) return;
          done = true;
          reject(error || self.msg);
        }
        self.msg.on('error', maybeError);
        self.msg.on('aborted', maybeError);
        self.msg.on('close', maybeError);
      });
    },
    function deducePayloadEncodingFromContentEncoding_(contentEncoding) {
      if ( ! contentEncoding ) {
        this.payloadEncoding_ = this.defaultEntityEncoding;
        return;
      }

      var match = contentEncoding.match(/charset=["]?([a-zA-Z0-9_-])["]?/i);
      if ( match === null ) {
        this.payloadEncoding_ = this.defaultEntityEncoding;
        return;
      }

      this.deducePayloadEncodingFromCharset_(match[1]);
    },
    function deducePayloadEncodingFromCharset_(charset) {
      var encodings = this.entityEncodings;
      for ( var i = 0; i < encodings; i++ ) {
        if ( encodings[i].charsetRegExp.test(charset) ) {
          this.payloadEncoding_ = encodings[i].bufferEncoding;
          break;
        }
      }
      this.payloadEncoding_ = this.defaultEntityEncoding;
    },
    function payloadStrToBuf_(str) {
      return new Buffer(str, this.payloadEncoding_);
    },
    {
      name: 'parseURL_',
      code: function(urlString) {
        return this.urlLib_.parse(urlString, true);
      }
    }
  ]
});
