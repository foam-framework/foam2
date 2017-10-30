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
  name: 'HTTPResponse',

  topics: [
    'data',
    'err',
    'end'
  ],

  properties: [
    {
      class: 'Int',
      name: 'status'
    },
    {
      class: 'String',
      name: 'responseType'
    },
    {
      class: 'Map',
      name: 'headers'
    },
    {
      name: 'payload',
      factory: function() {
        if ( this.streaming ) {
          return null;
        }

        switch ( this.responseType ) {
          case 'text':        return this.resp.text();
          case 'blob':        return this.resp.blob();
          case 'arraybuffer': return this.resp.arraybuffer();
          case 'json':        return this.resp.json();
        }

        // TODO: responseType should be an enum and/or have validation
        throw new Error('Unsupported response type: ' + this.responseType);
      }
    },
    {
      class: 'Boolean',
      name: 'streaming',
      value: false
    },
    {
      class: 'Boolean',
      name: 'success',
      expression: function(status) {
        return status >= 200 && status <= 299;
      }
    },
    {
      name: 'resp',
      postSet: function(_, r) {
        if ( r.headers.entries ) this.copyHeaders_(r);
        else                     this.copyHeadersEdge_(r);
        this.status = r.status;
      }
    }
  ],

  methods: [
    function start() {
      var reader = this.resp.body.getReader();
      this.streaming = true;

      var onError = foam.Function.bind(function(e) {
        this.err.pub();
        this.end.pub();
      }, this);

      var onData = foam.Function.bind(function(e) {
        if ( e.value ) {
          this.data.pub(e.value);
        }

        if ( e.done || ! this.streaming) {
          this.end.pub();
          return this;
        }
        return reader.read().then(onData, onError);
      }, this);

      return reader.read().then(onData, onError);
    },

    function stop() {
      this.streaming = false;
    },
    function copyHeaders_(r) {
      var iterator = r.headers.entries();
      var next = iterator.next();
      while ( ! next.done ) {
        this.headers[next.value[0]] = next.value[1];
        next = iterator.next();
      }
    },
    function copyHeadersEdge_(r) {
      // Deal with https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13928907/
      var headers = this.headers;
      r.headers.forEach(function(value, key) {
        headers[key] = value;
      });
    }
  ]
});
