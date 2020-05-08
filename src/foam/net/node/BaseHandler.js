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
  name: 'BaseHandler',
  flags: ['node'],
  implements: [ 'foam.net.node.Handler' ],

  documentation: `Abstract Handler class; handle() returns true if handled,
      false if the server should keep looking.`,

  imports: [
    'warn',
    'error'
  ],

  properties: [
    {
      name: 'id',
      factory: function() {
        return `${this.cls_.id}<${foam.uuid.randomGUID()}>`;
      }
    }
  ],

  methods: [
    function handle(req, res) {
      this.__context__.warn('Abstract BaseHandler.handle() call');
      return false;
    },

    function send(res, status, body) {
      res.setStatusCode(status);
      res.write(body, 'utf8');
      res.end();
    },

    function sendJSON(res, status, json) {
      res.setHeader('Content-type', 'application/json');
      this.send(res, status, JSON.stringify(json));
    },

    function sendStringAsHTML(res, status, str) {
      res.setHeader('Content-type', 'text/html; charset=utf-8');
      this.send(res, status, foam.parsers.html.escapeString(str));
    },

    function send400(req, res, error) {
      this.sendMessage(req, res, 400, 'Bad request');
      this.reportErrorMsg(req, ' Bad request: ' + error);
    },

    function send404(req, res) {
      this.sendMessage(req, res, 404, 'File not found: ' + req.urlString);
    },

    function send500(req, res, error) {
      this.sendMessage(req, res, 500, 'Internal server error');
      this.reportErrorMsg(req, 'Internal server error: ' + error);
      console.log(error.stack);
    },
    function sendMessage(req, res, status, msg) {
      if ( req.headers.accept &&
          req.headers.accept.indexOf('application/json') !== -1 ) {
        this.sendJSON(res, status, { message: msg });
      } else {
        this.sendStringAsHTML(res, status, msg);
      }
    },
    function reportWarnMsg(req, msg) {
      this.__context__.warn(msg);
    },
    function reportErrorMsg(req, msg) {
      this.error(msg);
    }
  ],

  listeners: [
    function onAddRoute(route) {
      return this.clone(route);
    }
  ]
});
