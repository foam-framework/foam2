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
  package: 'foam.net.auth',
  name: 'AuthAgent',

  properties: [
    {
      class: 'Enum',
      of: 'foam.net.auth.CredentialType',
      name: 'credentialType',
      required: true
    },
    {
      class: 'Function',
      documentation: `Determine whether or not a URL should be authenticated
          using this agent. This procedure is treated as data rather than a
          method because it is typically injected for an agent at runtime. E.g.,
          a particular Google 2LO agent would be bound to particular URLs and
          particular scopes.`,
      name: 'shouldAuthenticate',
      required: true
    },
  ],

  methods: [
    {
      name: 'getCredential',
      documentation: 'Aynchronously get an unexpired credential.',
      code: function() {
        return Promise.reject(new Error('Unable to get credential'));
      }
    }
  ]
});
