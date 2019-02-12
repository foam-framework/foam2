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
  name: 'SimpleRouter',
  extends: 'foam.net.node.BaseHandler',
  implements: [ 'foam.net.node.Router' ],
  flags: ['node'],
  requires: [
    'foam.net.node.RouteBinding',
    'foam.net.node.Router'
  ],
  imports: [ 'warn' ],

  properties: [
    {
      name: 'id',
      factory: function() {
        return `${this.cls_.id}<${foam.uuid.randomGUID()}>`;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.net.node.RouteBinding',
      name: 'bindings'
    }
  ],

  methods: [
    function addRoute(route, handler) {
      var handlerToBind = handler.onAddRoute(route);
      this.bindings.push(this.RouteBinding.create({
        route: route,
        handler: handlerToBind
      }));
      return handlerToBind;
    },
    function handle(req, res) {
      var url = req.url;
      var handled = false;
      var bindings = this.bindings;
      for ( var i = 0; i < bindings.length; i++ ) {
        if ( bindings[i].route.match(url) ) {
          if ( handled ) {
            this.__context__.warn(`Route handler matches handled response (${url})`);
          } else {
            if ( bindings[i].handler.handle(req, res) ) {
              handled = true;
            } else {
              this.__context__.warn(`Route handler failed to handle ${url}`);
            }
          }
        }
      }
      return handled;
    }
  ]
});
