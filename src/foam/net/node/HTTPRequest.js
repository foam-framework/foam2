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
  name: 'HTTPRequest',
  extends: 'foam.net.web.HTTPRequest',

  requires: [
    'foam.net.node.HTTPResponse'
  ],

  flags: ['node'],

  properties: [
    {
      class: 'Boolean',
      name: 'followRedirect',
      value: true
    },
    {
      name: 'urlLib',
      factory: function() { return require('url'); }
    }
  ],

  methods: [
    function fromUrl(url) {
      var data = this.urlLib.parse(url);
      if ( data.protocol ) this.protocol = data.protocol.slice(0, -1);
      if ( data.hostname ) this.hostname = data.hostname;
      if ( data.port ) this.port = data.port;
      if ( data.path ) this.path = data.path;

      return this;
    },

    function copyUrlFrom(other) {
      if ( other.url ) {
        this.fromUrl(other.url);
        return this;
      }

      this.protocol = other.protocol;
      this.hostname = other.hostname;
      if ( other.port ) this.port = other.port;
      other.path = other.path;

      return this;
    },

    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }
      this.addContentHeaders();

      if ( this.protocol !== 'http' && this.protocol !== 'https' )
        throw new Error("Unsupported protocol '" + this.protocol + "'");

      // 'Content-Length' or 'Transfer-Encoding' required for some requests
      // to be properly handled by Node JS servers.
      // See https://github.com/nodejs/node/issues/3009 for details.

      var buf;
      if ( this.payload && this.Blob.isInstance(this.payload) ) {
        this.headers['Content-Length'] = this.payload.size;
      } else if ( this.payload ) {
        buf = Buffer.from(this.payload, 'utf8');
        if ( ! this.headers['Content-Length'] ) {
          this.headers['Content-Length'] = buf.length;
        }
      }

      var options = {
        hostname: this.hostname,
        headers: this.headers,
        method: this.method,
        path: this.path
      };
      if ( this.port ) options.port = this.port;

      return new Promise(function(resolve, reject) {
        var req = require(this.protocol).request(options, function(nodeResp) {
          var resp = this.HTTPResponse.create({
            resp: nodeResp,
            responseType: this.responseType
          });

          // TODO(markdittmer): Write integration tests for redirects, including
          // same-origin/path-only redirects.
          if ( this.followRedirect &&
               ( resp.status === 301 ||
                 resp.status === 302 ||
                 resp.status === 303 ||
                 resp.status === 307 ||
                 resp.status === 308 ) ) {
            resolve(this.cls_.create({
              method: this.method,
              payload: this.payload,
              responseType: this.responseType,
              headers: this.headers,
              followRedirect: true
              // Redirect URL may not contain all parts if it points to same domain.
              // Copy original URL and overwrite non-null parts from "location"
              // header.
            }).copyUrlFrom(this).fromUrl(resp.headers.location).send());
          } else {
            resolve(resp);
          }
        }.bind(this));

        req.on('error', function(e) {
          reject(e);
        });

        if ( this.payload && this.Blob.isInstance(this.payload) ) {
          this.payload.pipe(function(buf) {
            if ( req.write(buf) ) {
              return new Promise(function(resolve) { req.once('drain', resolve); });
            }
          }).then(function() {
            req.end();
          });
          return;
        } else if ( this.payload ) {
          req.write(buf);
          req.end();
          return;
        }

        req.end();
      }.bind(this));
    }
  ]
});
