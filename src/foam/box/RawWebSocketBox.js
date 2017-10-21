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
  name: 'RawWebSocketBox',
  implements: ['foam.box.Box'],
  imports: [
    {
      name: 'me',
      key: 'me',
      javaType: 'foam.box.Box'
    },
    {
      key: 'registry',
      name: 'registry',
      javaType: 'foam.box.BoxRegistry',
    }
  ],

  properties: [
    {
      class: 'Object',
      name: 'socket',
      javaType: 'org.java_websocket.WebSocket'
    }
  ],

  classes: [
    foam.core.InnerClass.create({
      generateJava: false,
      model: {
        name: 'JSONOutputter',
        extends: 'foam.json.Outputter',
        requires: [
          'foam.box.ReturnBox'
        ],
        imports: [
          'me'
        ],
        methods: [
          function output(o) {
            if ( o === this.me ) {
              return this.SUPER(this.ReturnBox.create());
            }
            return this.SUPER(o);
          }
        ]
      }
    })
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        var replyBox = msg.attributes.replyBox;
        if ( replyBox ) {
          // TODO: We should probably clone here, but often the message
          // contains RPC arguments that don't clone properly.  So
          // instead we will mutate replyBox and put it back after.

          // Even better solution would be to move replyBox to a
          // property on Message and have custom serialization in it to
          // do the registration.
          msg.attributes.replyBox =
            this.__context__.registry.register(null, null, msg.attributes.replyBox);
        }

        var payload = this.JSONOutputter.create().copyFrom(foam.json.Network).stringify(msg);

        if ( replyBox ) {
          msg.attributes.replyBox = replyBox;
        }

        try {
          this.socket.send(payload);
        } catch(e) {
          replyBox && replyBox.send(foam.box.Message.create({ object: e }));
        }
      },
      javaCode: `
foam.lib.json.Outputter outputter = new Outputter();
outputter.setX(getX());

// TODO: Clone message or something when it clones safely.
foam.box.Box replyBox = (foam.box.Box)message.getAttributes().get("replyBox");

foam.box.SubBox export = (foam.box.SubBox)getRegistry().register(null, null, replyBox);

String payload = outputter.stringify(message);

message.getAttributes().put("replyBox", replyBox);

getSocket().send(payload);
`
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
protected class Outputter extends foam.lib.json.Outputter {
  public Outputter() {
    super(foam.lib.json.OutputterMode.NETWORK);
  }

  protected void outputFObject(foam.core.FObject o) {
    if ( o == getMe() ) {
      o = getX().create(foam.box.ReturnBox.class);
    }
    super.outputFObject(o);
  }
}
`}));
      }
    }
  ]
});
