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
  name: 'HTTPRequest',

  requires: [
    'foam.net.web.HTTPResponse',
    'foam.blob.Blob',
    'foam.blob.BlobBlob'
  ],

  topics: [
    'data'
  ],

  properties: [
    {
      class: 'String',
      name: 'hostname'
    },
    {
      class: 'Int',
      name: 'port'
    },
    {
      class: 'String',
      name: 'protocol',
      preSet: function(old, nu) {
        return nu.replace(':', '');
      }
    },
    {
      class: 'String',
      name: 'path',
      preSet: function(old, nu) {
        if ( ! nu.startsWith('/') ) return '/' + nu;
        return nu;
      }
    },
    {
      class: 'String',
      name: 'url'
    },
    {
      class: 'String',
      name: 'method',
      value: 'GET'
    },
    {
      class: 'Map',
      name: 'headers'
    },
    {
      name: 'payload'
    },
    {
      // TODO: validate acceptable types
      class: 'String',
      name: 'responseType',
      value: 'text'
    },
    {
      class: 'String',
      name: 'contentType',
      factory: function() { return this.responseType; }
    },
    {
      class: 'String',
      name: 'mode',
      value: 'cors'
    }
  ],

  methods: [
    function fromUrl(url) {
      var u = new URL(url);
      this.protocol = u.protocol.substring(0, u.protocol.length-1);
      this.hostname = u.hostname;
      if ( u.port ) this.port = u.port;
      this.path = u.pathname + u.search;
      return this;
    },

    function send() {
      if ( this.url ) {
        this.fromUrl(this.url);
      }
      this.addContentHeaders();

      this.headers['Pragma'] = 'no-cache';
      this.headers['Cache-Control'] = 'no-cache, no-store';

      var self = this;

      var headers = new Headers();
      for ( var key in this.headers ) {
        headers.set(key, this.headers[key]);
      }

      var options = {
        method: this.method,
        headers: headers,
        mode: this.mode,
        redirect: "follow",
        credentials: "same-origin"
      };

      if ( this.payload ) {
        if ( this.BlobBlob.isInstance(this.payload) ) {
          options.body = this.payload.blob;
        } else if ( this.Blob.isInstance(this.payload) ) {
          foam.assert(false, 'TODO: Implemented sending of foam.blob.Blob over HTTPRequest.');
        } else {
          options.body = this.payload;
        }
      }

      var request = new Request(
          this.protocol + "://" +
          this.hostname +
          ( this.port ? ( ':' + this.port ) : '' ) +
          this.path,
          options);

      return fetch(request).then(function(resp) {
        var resp = this.HTTPResponse.create({
          resp: resp,
          responseType: this.responseType
        });

        if ( resp.success ) return resp;

        // Use Promise.reject so crappy debuggers don't pause here
        // throw resp;
        return Promise.reject(resp);
      }.bind(this));
    },
    function addContentHeaders() {
      // Specify Content-Type header when it can be deduced.
      if ( ! this.headers['Content-Type'] ) {
        switch ( this.contentType ) {
          case 'text':
          this.headers['Content-Type'] = 'text/plain';
          break;
          case 'json':
          this.headers['Content-Type'] = 'application/json';
          break;
          case 'url':
          this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          break;
        }
      }
      // Specify this.contentType when it can be deduced.
      if ( ! this.headers['Accept'] ) {
        switch ( this.contentType ) {
          case 'json':
          this.headers['Accept'] = 'application/json';
          break;
        }
      }
    }
  ]
});
