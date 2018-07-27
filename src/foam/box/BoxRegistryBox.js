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
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'registrySkeleton',
      factory: function() {
        return this.SkeletonBox.create({ data: this });
      },
      // TODO check if this leaks.
      swiftFactory: 'return SkeletonBox_create(["data": self])',
      swiftPostSet: function() {/*
if let oldValue = oldValue as? foam_box_SkeletonBox {
  oldValue.clearProperty("data")
}
      */},
    }
  ],

  methods: [
    {
      name: 'init',
      swiftCode: function() {/*
self.onDetach(Subscription(detach: {
  if self.hasOwnProperty("registrySkeleton") {
    (self.registrySkeleton as? foam_core_FObject)?.clearProperty("data")
  }
}))
      */},
      code: function() { this.SUPER() },
    },
    {
      name: 'send',
      swiftCode: function() {/*
if let object = msg.object as? foam_box_SubBoxMessage {
  let name = object.name

  if let reg = registry_[name] as? Registration {
    msg.object = object.object;
    try reg.localBox.send(msg);
  } else {
    if let errorBox = msg.attributes["errorBox"] as? foam_box_Box {
      try errorBox.send(
        Message_create([
          "object": NoSuchNameException_create(["name": name ])
        ]))
    }
  }
} else if let _ = msg.object as? foam_box_HelloMessage {
} else {
  try registrySkeleton!.send(msg)
}
      */},
      code: function(msg) {
        if ( this.SubBoxMessage.isInstance(msg.object) ) {
          var name = msg.object.name;

          if ( this.registry_[name] && this.registry_[name].localBox ) {
            // Unpack sub box object... is this right?
            msg.object = msg.object.object;
            this.registry_[name].localBox.send(msg);
          } else {
            if ( msg.attributes.replyBox ) {
              msg.attributes.replyBox.send(
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
  } else if ( message.getAttributes().containsKey("replyBox") ) {
    foam.box.Box replyBox = (foam.box.Box)message.getAttributes().get("replyBox");
    foam.box.Message errorMessage = getX().create(foam.box.Message.class);
    errorMessage.setObject(getX().create(foam.box.NoSuchNameException.class));

    replyBox.send(errorMessage);
  }
}
`
    }
  ]
});
