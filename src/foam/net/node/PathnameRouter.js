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
  name: 'PathnameRouter',
  extends: 'foam.net.node.SimpleRouter',
  implements: [ 'foam.net.node.PathnamePrefixHandler' ],
  flags: ['node'],
  requires: [
    'foam.net.node.PathnamePrefixHandler',
    'foam.net.node.PathnameHandler',
    'foam.net.node.PathnamePrefixRoute',
    'foam.net.node.PathnameRoute'
  ],

  methods: [
    function addPathnamePrefix(pathnamePrefix, handler) {
      var route = this.PathnamePrefixRoute.create({
        pathnamePrefix: pathnamePrefix
      });
      foam.assert(this.PathnamePrefixHandler.isInstance(handler),
                  'PathnameRouter: Expected PathnamePrefixHandler');
      return this.addRoute(route, handler);
    },
    function addPathname(pathname, handler) {
      var route = this.PathnameRoute.create({
        pathname: pathname
      });
      foam.assert(this.PathnameHandler.isInstance(handler),
                  'PathnameRouter: Expected PathnameHandler');
      return this.addRoute(route, handler);
    }
  ]
});
