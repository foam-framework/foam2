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
  name: 'AuthAgent',

  documentation: `An agent that is able to authenticate on application's behalf
      for HTTP requests that require authorization. Implementations must do the
      following:

      (0) Export self as "authAgent" (already done in base class);
      (1) Register an auto-authenticating HTTPRequest as 'foam.net.HTTPRequest'
          in agents' sub-contexts;
      (2) Implement getCredential().

      Clients instantiating agents must provide a requiresAuthorization(request)
      implementation; this allows authenticating HTTPRequests to determine
      whether or not to authenticate before attempting a request.`,

  exports: [ 'as authAgent' ],

  properties: [
    {
      class: 'Function',
      documentation: `Determine whether or not a URL requires authorization
          via an authentication step managed by this agent. This procedure is
          treated as data rather than a method because it is typically injected
          for an agent at runtime. E.g., a particular Google 2LO agent would be
          bound to particular URLs and particular scopes.`,
      name: 'requiresAuthorization',
      required: true
    },
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();
    },
    function validate() {
      this.SUPER();
      foam.assert(
          this.__context__.lookup('foam.net.BaseHTTPRequest') !==
              this.__subContext__.lookup('foam.net.HTTPRequest'),
          'AuthAgent implementation must register its HTTPRequest decorator ' +
              'as foam.net.HTTPRequest');
    },
    {
      name: 'getCredential',
      documentation: 'Aynchronously get an unexpired credential.',
      code: function() {
        return Promise.reject(new Error('Unable to get credential'));
      }
    }
  ]
});
