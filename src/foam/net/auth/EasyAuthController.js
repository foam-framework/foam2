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
  name: 'EasyAuthController',

  documentation: `Controller that acts as a contextual container for
      authenticating HTTP requests. Uses data associated with the injected
      "authAgent" to setup a context that will automatically authorize
      requests that "authAgent" provide authorization for.`,

  imports: [ 'authAgent? as ctxAuthAgent' ],
  exports: [ 'authAgent' ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.net.auth.AuthAgent',
      name: 'authAgent',
      factory: function() { return this.ctxAuthAgent || null; },
      required: true
    }
  ],

  methods: [
    function init() {
      this.validate();

      this.__subContext__.register(
          this.authAgent.credentialType.httpRequestClass,
          'foam.net.HTTPRequest');
    }
  ]
});
