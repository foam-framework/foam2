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
  name: 'PathnamePrefixRoute',
  implements: [ 'foam.net.node.Route' ],
  flags: ['node'],
  imports: [ 'parentPrefix?' ],
  exports: [ 'pathnamePrefix as parentPrefix' ],

  properties: [
    {
      class: 'String',
      name: 'pathnamePrefix',
      preSet: function(_, nu) {
        return `${this.parentPrefix || ''}${nu}`;
      },
      required: true
    }
  ],

  methods: [
    function match(url) {
      return url.pathname.indexOf(this.pathnamePrefix) === 0;
    }
  ]
});
