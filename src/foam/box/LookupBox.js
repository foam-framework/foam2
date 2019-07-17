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
  name: 'LookupBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.ClientBoxRegistry',
    'foam.box.AnonymousBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'parentBox'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.BoxRegistry',
      name: 'registry',
      transient: true,
      factory: function() {
        return this.ClientBoxRegistry.create({
          delegate: this.parentBox
        });
      },
      swiftFactory: function() {/*
return ClientBoxRegistry_create([
  "delegate": parentBox
])
      */}
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        return this.registry.doLookup(this.name);
      },
      swiftFactory: 'return try! registry!.doLookup(name)!',
    }
  ],
  methods: [
    function send(msg) {
      var self = this;
      var replyBox = msg.attributes.replyBox.localBox;

      msg.attributes.replyBox.localBox = this.AnonymousBox.create({
        f: function(m) {
          if ( foam.core.Exception.isInstance(m.object) ) {
            self.delegate = undefined;
          }
          replyBox && replyBox.send(m);
        }
      });

      this.delegate.send(msg);
    }
  ]
});
