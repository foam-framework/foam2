/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaReplayingDAO',
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
      name: 'replaying',
      class: 'Boolean',
      value: true,
      visibility: 'RO'
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
      name: 'find_',
      javaCode: `
      getLogger().debug("find");
      blockOnReplay();
      return getDelegate().find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
      getLogger().debug("select");
      blockOnReplay();
      return getDelegate().select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'put_',
      javaCode: `
      getLogger().debug("put");
      blockOnReplay();
      return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      getLogger().debug("remove");
      blockOnReplay();
      return getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      getLogger().debug("removeAll");
      blockOnReplay();
      getDelegate().removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ReplayCompleteCmd ) {
        getLogger().info("replay complete");
        synchronized ( replayingLock_ ) {
          setReplaying(false);
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
      javaCode: `
      if ( ! getReplaying() ) {
        return;
      }
      synchronized ( replayingLock_ ) {
        if ( getReplaying() ) {
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
 
