/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RoutingJDAO',
  extends: 'foam.dao.java.JDAO',

  documentation:
    `JDAO that adds the service name to the context to use for routing to correct DAO.
    Doing this allows the underlying journal implementation to output the DAO name
    alongside the journal entry which will aid in using a single journal file.`,

  properties: [
    {
      class: 'String',
      name: 'service',
      documentation: 'Name of the service'
    },
    {
      class: 'Boolean',
      name: 'replayed',
      documentation: 'Has this journal been replayed yet?'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public final static Object ROUTING_JDAO_REPLAYED_CMD = new Object();
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      documentation: `Put object on the journal. If the journal hasn't been
        replayed yet- wait.`,
      javaCode: `
        if ( ! getReplayed() ) {
          synchronized ( ROUTING_JDAO_REPLAYED_CMD ) {
            try {
              ROUTING_JDAO_REPLAYED_CMD.wait();
            } catch (java.lang.InterruptedException i) {}
          }
        }
        return super.put_(x.put("service", getService()), obj);
      `
    },
    {
      name: 'remove_',
      documentation: `Remove object from the journal. If the journal hasn't been
        replayed yet- wait.`,
      javaCode: `
        if ( ! getReplayed() ) {
          synchronized ( ROUTING_JDAO_REPLAYED_CMD ) {
            try {
              ROUTING_JDAO_REPLAYED_CMD.wait();
            } catch (java.lang.InterruptedException i) {}
          }
        }

        return super.remove_(x.put("service", getService()), obj);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
        if ( obj == ROUTING_JDAO_REPLAYED_CMD ) {
          synchronized ( ROUTING_JDAO_REPLAYED_CMD ) {
            setReplayed(true);
            ROUTING_JDAO_REPLAYED_CMD.notifyAll();
          }
          return obj;
        }

        return getDelegate().cmd(obj);
      `
    }
  ]
});
