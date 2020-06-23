/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayingDAO',
  extends: 'foam.dao.ProxyDAO',


  documentation: `All DAO operations will block until Replay is complete.`,

  javaImports: [
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  private Object replayingLock_ = new Object();
          `
        }));
      }
    }
  ],
  
  properties: [
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
      name: 'find_',
      javaCode: `
      getLogger().debug("find");
      blockOnReplay(x);
      return getDelegate().find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
      getLogger().debug("select");
      blockOnReplay(x);
      return getDelegate().select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'put_',
      javaCode: `
      getLogger().debug("put");
      blockOnReplay(x);
      return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      getLogger().debug("remove");
      blockOnReplay(x);
      return getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      getLogger().debug("removeAll");
      blockOnReplay(x);
      getDelegate().removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ReplayCompleteCmd ) {
        getLogger().info("replay complete");
        synchronized ( replayingLock_ ) {
          getLogger().debug("notifyAll");
          replayingLock_.notifyAll();
        }
        return obj;
      }
      return getDelegate().cmd_(x, obj);
      `
    },
    {
      name: 'blockOnReplay',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");

      if ( ! replaying.getReplaying() ) {
        return;
      }

      synchronized ( replayingLock_ ) {
        if ( replaying.getReplaying() ) {
          try {
            getLogger().debug("wait");
            replayingLock_.wait();
            getLogger().debug("wake");
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
      }
      `
    }
  ]
});
 
