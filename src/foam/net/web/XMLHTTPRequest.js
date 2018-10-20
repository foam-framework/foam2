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
  package: 'foam.net.web',
  name: 'XMLHTTPRequest',
  extends: 'foam.net.web.HTTPRequest',

  requires: [
    'foam.net.web.XMLHTTPResponse as HTTPResponse'
  ],

  methods: [
    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }

      var xhr = new XMLHttpRequest();
      xhr.open(
          this.method,
          this.protocol + "://" +
          this.hostname + ( this.port ? ( ':' + this.port ) : '' ) +
          this.path);
      xhr.responseType = this.responseType;
      for ( var key in this.headers ) {
        xhr.setRequestHeader(key, this.headers[key]);
      }

      var self = this;
      return new Promise(function(resolve, reject) {
        xhr.addEventListener('readystatechange', function foo() {
          if ( this.readyState === this.LOADING || this.readyState === this.DONE ) {
            this.removeEventListener('readystatechange', foo);

            var resp = self.HTTPResponse.create({xhr: this});

            if ( resp.success ) {
              resolve(resp);
            } else {
              reject(resp);
            }
          }
        });
        xhr.send(self.payload);
      });
    }
  ]
});
