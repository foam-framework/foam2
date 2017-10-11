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
  name: 'SkeletonBox',
  implements: ['foam.box.Box'],

  requires: [
    'foam.box.Message',
    'foam.box.RPCMessage',
    'foam.box.RPCReturnMessage',
    'foam.box.RPCErrorMessage',
    'foam.box.InvalidMessageException'
  ],

  properties: [
    {
      name: 'data'
    }
  ],

  methods: [
    {
      name: 'call',
      args: [
        {
          class: 'FObjectProperty',
          of: 'foam.box.Message',
          name: 'message',
        },
      ],
      code: function(message) {
        var p;

        try {
          var method = this.data.cls_.getAxiomByName(message.object.name);
          var args = message.object.args.slice();

          // TODO: This is pretty hackish.  Context-Oriented methods should just be modeled.
          if ( method && method.args && method.args[0] && method.args[0].name == 'x' ) {
            var x = this.__context__.createSubContext({
              message: message
            });
            args[0] = x;
          }

          p = this.data[message.object.name].apply(this.data, args);
        } catch(e) {
          message.attributes.errorBox && message.attributes.errorBox.send(this.Message.create({
            object: this.RPCErrorMessage.create({ data: e.message })
          }));

          return;
        }

        var replyBox = message.attributes.replyBox;

        var self = this;

        if ( p instanceof Promise ) {
          p.then(
            function(data) {
              replyBox.send(self.Message.create({
                object: self.RPCReturnMessage.create({ data: data })
              }));
            },
            function(error) {
              message.attributes.errorBox && message.attributes.errorBox.send(self.Message.create({
                object: self.RPCErrorMessage.create({ data: error && error.toString() })
              }));
            });
        } else {
          replyBox && replyBox.send(this.Message.create({
            object: this.RPCReturnMessage.create({ data: p })
          }));
        }
      },
      swiftCode: function() {/*
do {
  guard let object = message?.object as? RPCMessage,
        let data = self.data as? FObject,
        let method = data.ownClassInfo().axiom(byName: object.name) as? MethodInfo
  else {
    throw InvalidMessageException_create()
  }

  // TODO handle context oriented methods.

  var p = try method.call(data, args: object.args)

  guard let replyBox = message?.attributes["replyBox"] as? Box else { return }
  if let pFut = p as? Future<Any> { p = try pFut.get() }
  try replyBox.send(Message_create([
    "object": RPCReturnMessage_create(["data": p])
  ]))
} catch let e {
  if let errorBox = message?.attributes["errorBox"] as? Box {
    try? errorBox.send(Message_create([
      "object": RPCErrorMessage_create([
        "data": e.localizedDescription
      ])
    ]))
  }
}
      */},
    },

    {
      name: 'send',
      code: function(message) {
        if ( this.RPCMessage.isInstance(message.object) ) {
          this.call(message);
          return;
        }

        throw this.InvalidMessageException.create({
          messageType: message.cls_ && message.cls_.id
        });
      },
      swiftCode: function() {/*
if let _ = msg.object as? RPCMessage {
  call(msg)
  return
}

throw InvalidMessageException_create([
  "messageType": msg.ownClassInfo().id,
])
      */},
    },
  ]
});
