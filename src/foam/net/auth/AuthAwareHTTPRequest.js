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
  package: 'foam.net.auth',
  name: 'AuthAwareHTTPRequest',
  extends: 'foam.net.BaseHTTPRequest',

  documentation: 'Abstract class for HTTP requests that require authorization.',

  requires: [ 'foam.net.BaseHTTPRequest' ],
  imports: [ 'authAgent? as ctxAuthAgent' ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.net.BaseHTTPRequest',
      name: 'delegate',
      factory: function() {
        return this.BaseHTTPRequest.create(this);
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.net.auth.AuthAgent',
      name: 'authAgent',
      factory: function() { return this.ctxAuthAgent || null; }
    }
  ],

  methods: [
    function send() {
      var send = this.delegate.send.bind(this.delegate);
      if ( ! this.authAgent ) return send();
      if ( ! this.authAgent.requiresAuthorization(this) ) return send();

      return this.authAgent.getCredential().then(this.onGetCredential)
          .then(send).then(this.onAuthorizedResponse);
    }
  ],

  listeners: [
    {
      name: 'onGetCredential',
      documentation: 'Prepare request using credential from "authAgent".',
      code: function() {
        throw new Error("Abstract AuthAwareHTTPRequest doesn't understand " +
            'credentials');
      }
    },
    {
      name: 'onAuthorizedResponse',
      documentation: `Check response on authorized request for HTTP 401, in
          which case, retry.`,
      code: function(response) {
        if ( response.status !== 401 ) return response;

        var send = this.delegate.send.bind(this.delegate);
        return this.authAgent.refreshCredential().then(this.onGetCredential)
            .then(send).then(this.onRetryResponse);
      }
    },
    {
      name: 'onRetryResponse',
      documentation: `Check response on authorized request for HTTP 401, in
          which case, throw: forced  credential refresh didn't work.`,
      code: function(response) {
        if ( response.status !== 401 ) return response;

        throw new Error('Authorization failed: Request rejected after forced credential refresh');
      }
    }
  ]
});
