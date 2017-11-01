/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.net.node',
  name: 'Router',

  methods: [
    {
      name: 'addRoute',
      documentation: `Bind a route to a handler in the context of this Router
          object.`,
      args: [
        {
          name: 'route',
          documentation: `The route specification to add.`,
          typeName: 'foam.net.node.Route'
        },
        {
          name: 'handler',
          documentation: `The handler responsible for the route.`,
          typeName: 'foam.net.node.Handler'
        }
      ],
      returns: 'Boolean',
      code: function(route, handler) {}
    }
  ]
});
