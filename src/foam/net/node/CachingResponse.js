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
  name: 'CachingResponse',
  extends: 'foam.net.node.CachedResponse',
  implements: [ 'foam.net.node.ServerResponse' ],
  flags: ['node'],
  documentation: `Response decorator that stores response data and produces
      a CachedResponse when this response is finalized.`,

  requires: [ 'foam.net.node.CachedResponse' ],
  imports: [
    'error',
    'info'
  ],

  topics: [
    'errored',
    'recorded'
  ],

  properties: [
    {
      name: 'id',
      required: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.net.node.ServerRequest',
      name: 'req',
      documentation: 'Initial request to be cached.',
      transient: true,
      required: true,
      final: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.net.node.ServerResponse',
      name: 'res',
      documentation: 'Initial response to be cached.',
      transient: true,
      required: true,
      final: true
    },
    {
      name: 'responseError',
      transient: true,
      value: null
    }
  ],

  methods: [
    function getStatusCode() {
      return this.res.getStatusCode();
    },
    function setStatusCode(statusCode) {
      if ( this.responseError ) return;

      this.statusCode = statusCode;
      this.res.setStatusCode(statusCode);
    },
    function setHeader(header, value) {
      if ( this.responseError ) return;

      this.headers[header] = value;
      this.res.setHeader(header, value);
    },
    function write(data, encoding) {
      if ( this.responseError ) return;

      var bufData = Buffer.isBuffer(data) ? data : new Buffer(data, encoding);
      this.data = Buffer.concat([this.data, bufData]);
      this.res.write(bufData);
    },
    function end(data, encoding) {
      if ( this.responseError ) return;

      var bufData;
      if ( data ) {
        bufData = Buffer.isBuffer(data) ? data : new Buffer(data, encoding);
        this.data = Buffer.concat([this.data, bufData]);
      }

      this.recorded.pub(this.CachedResponse.create(this));
      this.info(`CachingResponse: Recorded ${this.id}`);

      if ( data ) this.res.end(bufData); else this.res.end();
    },
    function pipeFrom(stream) {
      stream.on('data', this.write.bind(this));
      stream.on('end', this.end.bind(this));
      stream.on('error', this.onError);
    }
  ],

  listeners: [
    function onError(error) {
      this.responseError = error;
      this.errored.pub(error);
      this.error(`CachingResponse: Errored on ${this.id} with ${error}`);
    }
  ]
});
