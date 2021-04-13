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
  name: 'ReplyBox',
  extends: 'foam.box.ProxyBox',

  imports: [
    {
      name: 'registry',
      key: 'registry',
      type: 'foam.box.BoxRegistry'
    }
  ],

  javaImports: [
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Random',
    'java.util.UUID'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      factory: function() {
        // TODO: Do these need to be long lived?
        // Someone could store a box for days and then use it
        // at that point the ID might no longer be valid.
        return foam.next$UID();
      },
      swiftFactory: 'return UUID().uuidString',
      javaFactory: `
      java.util.Random r = ThreadLocalRandom.current();
      return new UUID(r.nextLong(), r.nextLong()).toString();
      `
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        this.registry.unregister(this.id);
        this.delegate.send(msg);
      },
      swiftCode: function() {/*
(registry as! foam_box_BoxRegistry).unregister(id)
try delegate.send(msg)
      */},
      javaCode: `
getRegistry().unregister(getId());
getDelegate().send(msg);
`
    }
  ]
});
