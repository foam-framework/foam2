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
  name: 'HTTPResponse',
  extends: 'foam.net.web.HTTPResponse',
  flags: ['node'],
  properties: [
    {
      name: 'payload',
      factory: function() {
        if ( this.streaming ) return null;

        var self = this;
        return new Promise(function(resolve, reject) {
          var buffer = ""
          self.resp.on('data', function(d) {
            buffer += d.toString();
          });
          self.resp.on('end', function() {
            switch (self.responseType) {
            case "text":
              resolve(buffer);
              return;
            case "json":
              try {
                resolve(JSON.parse(buffer));
              } catch ( error ) {
                reject(error);
              }
              return;
            }

            // TODO: responseType should be an enum and/or have validation.
            reject(new Error(
                'Unsupported response type: ' + self.responseType));
          });
          self.resp.on('error', function(e) {
            reject(e);
          });
        });
      }
    },
    {
      name: 'resp',
      postSet: function(_, r) {
        this.status = r.statusCode;
        this.headers = {};
        for ( var key in r.headers ) {
          this.headers[key.toLowerCase()] = r.headers[key];
        }
      }
    }
  ],

  methods: [
    function start() {
      this.streaming = true;

      return new Promise(function(resolve, reject) {
        this.resp.on('data', function(chunk) {
          this.data.pub(chunk);
        }.bind(this));

        this.resp.on('end', function() {
          this.end.pub();
          resolve(this);
        }.bind(this));

        this.resp.on('error', function(e) {
          reject(e);
        });
      }.bind(this));
    },

    function stop() {
      // TODO?
    }
  ]
});
