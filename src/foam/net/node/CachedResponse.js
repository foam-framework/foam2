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
  name: 'CachedResponse',
  flags: ['node'],
  documentation: `Finalized HTTP response that can be replayed.`,

  imports: [ 'info' ],

  properties: [
    {
      class: 'String',
      name: 'id',
      required: true
    },
    {
      class: 'Int',
      name: 'statusCode',
      value: 404
    },
    {
      class: 'Map',
      name: 'headers'
    },
    {
      // TODO(markdittmer): Implement string-based serialization support.
      name: 'data',
      factory: function() { return new Buffer(''); }
    },
    {
      name: 'stream',
      transient: true,
      factory: function() { return require('stream'); }
    }
  ],

  methods: [
    function replay(res) {
      this.validate();

      var headers = this.headers;
      for ( var key in headers ) {
        if ( ! headers.hasOwnProperty(key) ) continue;
        res.setHeader(key, headers[key]);
      }
      res.setStatusCode(this.statusCode);
      var stream = this.createStream();
      stream.push(this.data);
      stream.push(null);
      res.pipeFrom(stream);
      this.info(`CachedResponse: Replay ${this.id}`);
    },
    function createStream() {
      return new this.stream.Duplex();
    }
  ]
});
