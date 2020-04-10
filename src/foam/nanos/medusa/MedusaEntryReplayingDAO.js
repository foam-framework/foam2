/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryReplayingDAO',
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
      synchronized ( replayingLock_ ) {
        if ( getReplaying() ) {
          try {
            replayingLock_.wait();
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
      }
      return getDelegate().find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
      synchronized ( replayingLock_ ) {
        if ( getReplaying() ) {
          try {
            replayingLock_.wait();
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
      }
      return getDelegate().select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'put_',
      javaCode: `
      synchronized ( replayingLock_ ) {
        if ( getReplaying() ) {
          try {
            replayingLock_.wait();
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
      }
      return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      synchronized ( replayingLock_ ) {
        if ( getReplaying() ) {
          try {
            replayingLock_.wait();
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
      }
      return getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      synchronized ( replayingLock_ ) {
        if ( getReplaying() ) {
          try {
            replayingLock_.wait();
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
      }
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
          replayingLock_.notifyAll();

          // Replay complete - bring instance ONLINE. 
          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          support.setStatus(Status.ONLINE);
          support.setIsReplaying(false);
        }
        return obj;
      } else if ( obj instanceof MedusaEntry ) {
        return getDelegate().cmd_(x, obj);
      } else {
        synchronized ( replayingLock_ ) {
          if ( getReplaying() ) {
            try {
              replayingLock_.wait();
            } catch (InterruptedException e) {
              throw new RuntimeException(e);
            }
          }
        }
        return getDelegate().cmd_(x, obj);
      }
      `
    },
    {
      name: 'blockOnReply',
      javaThrows: ['InterruptedException'],
      javaCode: `
      synchronized ( replayingLock_ ) {
        if ( getReplaying() ) {
          replayingLock_.wait();
        }
      }
      `
    }
  ]
});
 
