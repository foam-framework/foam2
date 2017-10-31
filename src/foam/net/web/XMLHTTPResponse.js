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
  name: 'XMLHTTPResponse',
  extends: 'foam.net.web.HTTPResponse',

  constants: {
    STREAMING_LIMIT: 10 * 1024 * 1024
  },

  properties: [
    {
      name: 'xhr',
      postSet: function(_, xhr) {
        this.status = xhr.status;
        var headers = xhr.getAllResponseHeaders().split('\r\n');
        for ( var i = 0 ; i < headers.length ; i++ ) {
          var sep = headers[i].indexOf(':');
          var key = headers[i].substring(0, sep);
          var value = headers[i].substring(sep+1);
          this.headers[key.trim()] = value.trim();
        }
        this.responseType = xhr.responseType;
      }
    },
    {
      name: 'payload',
      factory: function() {
        if ( this.streaming ) {
          return null;
        }

        var self = this;
        var xhr = this.xhr;

        if ( xhr.readyState === xhr.DONE )
          return Promise.resolve(xhr.response);
        else
          return new Promise(function(resolve, reject) {
            xhr.addEventListener('readystatechange', function() {
              if ( this.readyState === this.DONE )
                resolve(this.response);
            });
          });
      }
    },
    {
      class: 'Int',
      name: 'pos',
      value: 0
    }
  ],

  methods: [
    function start() {
      this.streaming = true;
      this.xhr.addEventListener('loadend', function() {
        this.done.pub();
      }.bind(this));

      this.xhr.addEventListener('progress', function() {
        var substr = this.xhr.responseText.substring(this.pos);
        this.pos = this.xhr.responseText.length;
        this.data.pub(substr);

        if ( this.pos > this.STREAMING_LIMIT ) {
          this.xhr.abort();
        }
      }.bind(this));
    }
  ]
});
