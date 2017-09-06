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
  package: 'foam.web',
  name: 'URLState',
  extends: 'foam.web.DetachedURLState',

  documentation: `A URL-based strategy for storing application state in the URL
      hash. Produces hashes of the form:

      #<path>?<key1>=<value1>&<key2>=<value2>...

      All parts are URI-encoded. The "path" is intended as a top-level
      description what view/controller the application is rendering. Keys and
      values additional state bindings to be reflected in the URL hash.`,

  requires: [
    'foam.json.Outputter',
    'foam.json.Parser'
  ],
  imports: [ 'warn', 'window' ],

  methods: [
    function init() {
      this.SUPER();
      this.setHash(this.window.location.hash);
      this.window.addEventListener('hashchange', this.onHashChange);
    },
  ],

  listeners: [
    function onHashChange() {
      this.setHash(this.window.location.hash);
      this.hashToState_();
    },
    {
      name: 'onStateChange',
      isMerged: true,
      mergeDelay: 150,
      code: function() {
        this.stateToHash_();
        this.window.location.hash = this.hash_;
      }
    }
  ]
});
