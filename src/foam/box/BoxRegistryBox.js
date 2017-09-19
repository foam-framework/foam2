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
  name: 'BoxRegistryBox',
  extends: 'foam.box.LocalBoxRegistry',

  implements: [ 'foam.box.Box' ],

  requires: [
    'foam.box.SubBoxMessage',
    'foam.box.Message',
    'foam.box.HelloMessage',
    'foam.box.SkeletonBox'
  ],

  properties: [
    {
      name: 'registrySkeleton',
      factory: function() {
        return this.SkeletonBox.create({ data: this });
      }
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(msg) {
        if ( this.SubBoxMessage.isInstance(msg.object) ) {
          var name = msg.object.name;

          if ( this.registry_[name] && this.registry_[name].localBox ) {
            // Unpack sub box object... is this right?
            msg.object = msg.object.object;
            this.registry_[name].localBox.send(msg);
          } else {
            if ( msg.attributes.errorBox ) {
              msg.attributes.errorBox.send(
                this.Message.create({
                  object: this.NoSuchNameException.create({ name: name })
                }));
            }
          }
        } else if ( this.HelloMessage.isInstance(msg.object) ) {
        } else {
          this.registrySkeleton.send(msg);
        }
      },
      javaCode: `
Object obj = message.getObject();

if ( obj instanceof foam.box.SubBoxMessage ) {
  foam.box.SubBoxMessage sbm = (foam.box.SubBoxMessage)obj;
  String name = sbm.getName();

  Registration dest = (Registration)getRegistry_().get(name);

  if ( dest != null ) {
    message.setObject(sbm.getObject());
    dest.getLocalBox().send(message);
  } else if ( message.getAttributes().containsKey("errorBox") ) {
    foam.box.Box errorBox = (foam.box.Box)message.getAttributes().get("errorBox");
    foam.box.Message errorMessage = getX().create(foam.box.Message.class);
    errorMessage.setObject(getX().create(foam.box.NoSuchNameException.class));

    errorBox.send(errorMessage);
  }
}
`
    }
  ]
});
