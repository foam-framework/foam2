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

foam.INTERFACE({
  package: 'foam.net.node',
  name: 'ServerResponse',
  flags: ['node'],
  documentation: `Reponse sent by HTTP server.`,

  methods: [
    {
      name: 'getStatusCode',
      documentation: 'Get HTTP status code.',
      type: 'Int',
      code: function() {}
    },
    {
      name: 'setStatusCode',
      documentation: 'Set HTTP status code.',
      args: [
        {
          name: 'statusCode',
          type: 'Integer'
        }
      ],
      code: function(statusCode) {}
    },
    {
      name: 'setHeader',
      documentation: 'Set HTTP header value.',
      args: [
        {
          name: 'header',
          documentation: 'The header name.',
          type: 'String'
        },
        {
          name: 'value',
          documentation: 'The header value.',
          type: 'String'
        }
      ],
      code: function(header, value) {}
    },
    {
      name: 'write',
      documentation: 'Write data to HTTP response body.',
      args: [
        {
          name: 'data',
          documentation: `Data to write to response body. Type must be supported
              by first argument in
              https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback`,
        },
        {
          name: 'encoding',
          documentation: `Encoding of data supported by second argument in
              https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback`,
        }
      ],
      code: function(data, encoding) {}
    },
    {
      name: 'end',
      documentation: 'Finalize HTTP response body.',
      args: [
        {
          name: 'data',
          documentation: `Data to write to response body. Type must be supported
              by first argument in
              https://nodejs.org/api/stream.html#stream_writable_end_chunk_encoding_callback`,
        },
        {
          name: 'encoding',
          documentation: `Encoding of data supported by second argument in
              https://nodejs.org/api/stream.html#stream_writable_end_chunk_encoding_callback`,
        }
      ],
      code: function(data, encoding) {}
    },
    {
      name: 'pipeFrom',
      documentation: `Inversion of control for NodeJS
          fromStream.pipe(toStream)`,
      args: [
        {
          name: 'stream',
          documentation: `Stream to pipe from (implementer of
              https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options`,
        }
      ],
      code: function(stream) {}
    }
  ]
});
