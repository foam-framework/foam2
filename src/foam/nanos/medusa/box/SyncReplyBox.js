/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.medusa.box',
  name: 'SyncReplyBox',
  implements: [ 'foam.box.Box' ],
  javaImports: [
    'foam.box.Box',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.Map',
    'java.util.concurrent.CountDownLatch'
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public SyncReplyBox(Map parked) {
    setParked(parked);
  }
          `
        }));
      }
    },
  ],

  properties: [
    {
      name: 'parked',
      class: 'Map'
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
      name: 'send',
      javaCode: `
      Long id = (Long) msg.getAttributes().get(SyncBox.SYNC_BOX_ID);
      if ( id != null ) {
        CountDownLatch latch = (CountDownLatch) getParked().get(id);
        getParked().put(id, msg);
        latch.countDown();
      }
      `
    }
  ]
});
