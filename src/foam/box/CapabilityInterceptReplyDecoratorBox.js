/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'CapabilityInterceptReplyDecoratorBox',
  extends: 'foam.box.ProxyBox',

  documentation: `
    This box decorates replyBox of the message with CapabilityInterceptBox
    before sending the message to its delegate.
  `,

  methods: [
    {
      name: 'send',
      javaCode: `
        foam.core.X x = getX();

        msg.getAttributes().put("replyBox",
          new CapabilityInterceptBox.Builder(x)
            .setDelegate((Box) msg.getAttributes().get("replyBox"))
            .build());
        getDelegate().send(msg);
      `
    }
  ]
});