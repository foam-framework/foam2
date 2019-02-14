/**
 * @license
 * Copyright 2015 The FOAM Authors. All Rights Reserved.
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
  name: 'Handler',
  flags: ['node'],
  methods: [
    {
      name: 'handle',
      args: [
        {
          name: 'req',
          documentation: 'Node JS HTTP request object. http.IncomingMessage',
        },
        {
          name: 'res',
          documentation: 'Node JS HTTP response object. http.ServerResponse',
        },
      ],
      type: 'Boolean',
      code: function(req, res) {}
    }
  ],

  listeners: [
    {
      name: 'onAddRoute',
      documentation: `Inversion of control for Route-Handler binding.`,
      args: [
        {
          name: 'route',
          documentation: `Route being bound to this handler.`,
          type: 'foam.net.node.Route'
        }
      ],
      type: 'foam.net.node.Handler'
    }
  ]
});
