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
  name: 'SimpleServerResponse',
  implements: [ 'foam.net.node.ServerResponse' ],
  flags: ['node'],
  documentation: `Reponse sent by HTTP server. Underlying Node JS response
      should be injected upon creation but treated as private.`,

  properties: [
    {
      name: 'res',
      documentation: 'Node JS http.ServerResponse object.',
      required: true,
      final: true
    }
  ],

  methods: [
    function getStatusCode() {
      return this.res.statusCode;
    },
    function setStatusCode(statusCode) {
      this.res.statusCode = statusCode;
    },
    function setHeader(header, value) {
      return this.res.setHeader(header, value);
    },
    function write(data, encoding) {
      return this.res.write(data, encoding);
    },
    function end(data, encoding) {
      return this.res.end(data, encoding);
    },
    function pipeFrom(stream) {
      return stream.pipe(this.res);
    }
  ]
});
