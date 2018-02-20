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
  name: 'SocketBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.BoxJsonOutputter',
    'foam.box.SocketConnectBox'
  ],
  exports: ['outputter'],

  axioms: [
    foam.pattern.Multiton.create({
      property: 'address'
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'address'
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        return this.SocketConnectBox.create({
          address: this.address
        });
      },
      swiftFactory: `
return SocketConnectBox_create([
  "address$": address$,
])
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.BoxJsonOutputter',
      name: 'outputter',
      factory: function() {
        return this.BoxJsonOutputter.create().copyFrom(foam.json.Network);
      }
    }
  ]
});
