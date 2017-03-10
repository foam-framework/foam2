/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'Handler',

  documentation: `Abstract Handler class; handle() returns true if handled,
      false if the server should keep looking.`,

  imports: [
    'warn',
    'error'
  ],

  methods: [
    function handle() {
      this.warn('Abstract Handler.handle() call');
      return false;
    },
    function send(res, status, body) {
      res.statusCode = status;
      res.write(body, 'utf8');
      res.end();
    },
    function sendJSON(res, status, json) {
      res.setHeader('Content-type', 'application/json');
      this.send(res, status, JSON.stringify(json));
    },
    function send404(req, res) {
      this.send(res, 404, 'File not found: ' + req.url);
    },
    function send500(req, res, error) {
      this.send(res, 500, 'Internal server error');
      this.error('Internal server error: ' + error);
    }
  ]
});
