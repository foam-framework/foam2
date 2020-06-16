/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.box',
  name: 'SyncBox',
  extends: 'foam.box.ProxyBox',

  javaImports: [
    'foam.box.Box',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.concurrent.atomic.AtomicLong',
    'java.util.concurrent.CountDownLatch',
    'java.util.HashMap',
    'foam.box.Message'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            private AtomicLong nextBoxId_ = new AtomicLong(0);
          `
        }));
      }
    },
  ],

  constants: [
    {
      name: 'SYNC_BOX_ID',
      value: 'syncBoxId',
      type: 'String'
    }
  ],

  properties: [
    {
      name: 'parked',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'getReplyBox',
      type: 'foam.box.Box',
      javaCode: `
      SyncReplyBox replyBox = new SyncReplyBox(getParked());
      replyBox.setX(getX());
      return replyBox;
      `
    },
    {
      name: 'send',
      javaCode: `
      Box replyBox = (Box) msg.getAttributes().get("replyBox");
      long id = nextBoxId_.incrementAndGet();
      msg.getAttributes().put(SYNC_BOX_ID, id);
      msg.getAttributes().put("replyBox", getReplyBox());
      CountDownLatch latch = new CountDownLatch(1);
      getParked().put(id, latch);
      try {
        getDelegate().send(msg);
        msg.getAttributes().put("replyBox", replyBox);
        // REVIEW : change wait so can wake to not block server shutdown?
        latch.await();
        Object o = getParked().get(id);
        replyBox.send((Message) o);
      } catch (InterruptedException e) {
        // nop
      } finally {
        getParked().remove(id);
      }
      `
    }
  ]
});
