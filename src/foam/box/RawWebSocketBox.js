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
  requires: [
    'foam.box.ReplyBox'
  ],
  imports: [
    {
      name: 'me',
      key: 'me',
      type: 'foam.box.Box'
    },
    {
      key: 'registry',
      name: 'registry',
      type: 'foam.box.BoxRegistry',
    }
  ],

  properties: [
    {
      class: 'Object',
      name: 'socket',
      javaType: 'foam.net.WebSocket'
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
        var payload = this.JSONOutputter.create().copyFrom(foam.json.Network).stringify(msg);

        try {
          this.socket.send(payload);
        } catch(e) {
          replyBox && replyBox.send(foam.box.Message.create({ object: e }));
        }
      },
      javaCode: `
foam.lib.json.Outputter outputter = new Outputter(getX());
outputter.setX(getX());

// TODO: Clone message or something when it clones safely.
foam.box.Box replyBox = (foam.box.Box)msg.getAttributes().get("replyBox");

if ( replyBox != null ) {
  foam.box.SubBox export = (foam.box.SubBox)getRegistry().register(null, null, replyBox);

  replyBox = new foam.box.ReplyBox(getX(), export.getName(), replyBox);
}

String payload = outputter.stringify(msg);

msg.getAttributes().put("replyBox", replyBox);

try {
  getSocket().send(payload);
} catch ( java.io.IOException e ) {
  foam.box.Message reply = new foam.box.Message();
  reply.setObject(e);
  if ( replyBox != null ) replyBox.send(reply);
}
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
  public Outputter(foam.core.X x) {
    super(x);
    setPropertyPredicate(new foam.lib.AndPropertyPredicate(x, new foam.lib.PropertyPredicate[] {new foam.lib.NetworkPropertyPredicate(), new foam.lib.PermissionedPropertyPredicate()}));
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
