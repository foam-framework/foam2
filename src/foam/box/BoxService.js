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
  name: 'BoxService',

  properties: [
    {
      class: 'Class',
      name: 'server'
    },
    {
      class: 'Class',
      name: 'client'
    }
  ],

  methods: [
    {
      name: 'serverBox',
      args: [
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'box',
        },
      ],
      returns: 'foam.box.Box',
      code: function serverBox(box) {
        box = this.next ? this.next.serverBox(box) : box;
        return this.server.create({ delegate: box })
      },
      swiftCode: function() {/*
// TODO verify what this.next is.
return server.create(["delegate": box]) as! Box
      */},
    },
    {
      name: 'clientBox',
      args: [
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'box',
        },
      ],
      returns: 'foam.box.Box',
      code: function(box) {
        box = this.client.create({ delegate: box });
        return this.next ?
          this.next.clientBox(box) :
          box;
      },
      swiftCode: function() {/*
// TODO this.next?
return client.create(["delegate": box]) as! Box
      */},
    },
  ]
});
