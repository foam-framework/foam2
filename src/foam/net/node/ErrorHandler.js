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
  name: 'ErrorHandler',
  extends: 'foam.net.node.BaseHandler',
  flags: ['node'],
  constants: {
    CLIENT_MESSAGES: {
      '400': 'Bad request',
      '404': 'File not found',
      '500': 'Internal server error',
      default_: 'Error'
    }
  },

  properties: [
    {
      class: 'String',
      name: 'logMessage',
      required: true,
      final: true
    },
    {
      class: 'Int',
      name: 'httpCode',
      value: 500,
      final: true
    },
    {
      class: 'String',
      name: 'clientMessage',
      factory: function() {
        var clientMessage = this.CLIENT_MESSAGES[this.httpCode];
        if ( ! clientMessage ) return this.CLIENT_MESSAGES.default_;

        return clientMessage;
      }
    }
  ],

  methods: [
    function handle(req, res) {
      this.sendMessage(req, res, this.httpCode, this.clientMessage);
      this.reportErrorMsg(req, this.httpCode + ' ' + this.clientMessage + ': ' +
                          req.urlString + ' ' + this.logMessage);
      return true;
    }
  ]
});
