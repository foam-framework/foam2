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
  package: 'foam.box',
  name: 'SocketConnectBox',
  extends: 'foam.box.PromisedBox',

  requires: [
    {
      flags: ['js'],
      path: 'foam.box.RawSocketBox',
    },
  ],

  properties: [
    {
      class: 'String',
      name: 'address'
    },
    {
      name: 'delegate',
      factory: function() {
        // Use default FOAM implementation of Socket. Do not attempt to lookup
        // sensitive "foam.net.node.Socket" class in box context.
        return foam.lookup('foam.net.node.Socket').create(null, this).
            connectTo(this.address).then(function(s) {
              return this.RawSocketBox.create({ socket: s });
            }.bind(this));
      },
      swiftFactory: `
let socketService = __context__["socketService"] as! SocketService // TODO import
return socketService.getSocketBoxFuture(address)
      `
    }
  ]
});
