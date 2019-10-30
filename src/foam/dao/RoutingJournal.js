/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RoutingFileJournal',
  extends: 'foam.dao.AbstractFileJournal',

  implements: [
    'foam.dao.RoutingJournal'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.util.concurrent.atomic.AtomicBoolean',
    'java.util.concurrent.locks.ReentrantLock'
  ],

  documentation:
    `Journal interface that also adds the DAO name to the journal entry so that one may use
    a single journal file and still be able to put the entry into the correct DAO`,

  properties: [
    {
      class: 'Boolean',
      name: 'replayed',
      javaPostSet: `
// If replayed is true, this will unblock anything waiting.
waitForReplay();
      `
    },
    {
      class: 'Map',
      of: 'foam.dao.DAO',
      javaType: 'java.util.Map<String, foam.dao.DAO>',
      name: 'replayDAOs'
    },
    {
      class: 'Map',
      javaType: 'java.util.Map<String, AtomicBoolean>',
      name: 'replayDAOWaitObjects'
    },
    {
      class: 'Object',
      javaType: 'ReentrantLock',
      name: 'replayDAOWaitObjectsLock',
      documentation: `
      getReplayDAO_ must establish this lock before a conditional
      put in replayDAOWaitObjects, and release this lock after
      obtaining a lock for a specific replayDAOWaitObject.
      A ReentrantLock was required because this behaviour is
      not possible by nesting syncronized blocks.
      `,
      javaFactory: `
        return new ReentrantLock();
      `
    }
  ],

  methods: [
    {
      name: 'waitForReplay',
      synchronized: true,
      javaCode: `
try {
  if ( ! getReplayed() ) wait();
  else notifyAll();
} catch (InterruptedException e) {
  throw new RuntimeException(e);
}
      `
    },
    {
      name: 'put',
      javaCode: `
        this.put_(x, dest, null, nu);
      `
    },
    {
      name: 'put_',
      javaCode: `
        if ( ! getReplayed() ) return;
        putWithPrefix_(x, old, nu, dest);
      `
    },
    {
      name: 'remove',
      javaCode: `
        if ( ! getReplayed() ) return;
        removeWithPrefix_(x, obj, dest);
      `
    },
    {
      name: 'assertReplayDAORegistered_',
      args: [ { name: 'service', type: 'String' } ],
      javaCode: `
        if ( ! getReplayDAOs().containsKey(service) ) {
          throw new RuntimeException(String.format(
            "Service '%s' completed initialization without registering a " +
            "replay DAO", service));
        }
      `
    },
    {
      name: 'getReplayDAO_',
      type: 'foam.dao.DAO',
      args: [
        { name: 'service', type: 'String' }
      ],
      javaCode: `
        if ( getReplayDAOs().containsKey(service) ) {
          return getReplayDAOs().get(service);
        }

        getReplayDAOWaitObjectsLock().lock();

        AtomicBoolean waitObj = null;

        if ( getReplayDAOWaitObjects().containsKey(service) ) {
          getReplayDAOWaitObjectsLock().unlock();
          waitObj = getReplayDAOWaitObjects().get(service);
          synchronized ( waitObj ) {
            while ( ! waitObj.get() ) {
              try {
                waitObj.wait();
              } catch ( InterruptedException e ) {
                // Interrupt invokes retry
                continue;
              }
            }
          }
          return getReplayDAO_(service);
        }

        waitObj = new AtomicBoolean();

        synchronized ( waitObj ) {
          getReplayDAOWaitObjects().put(service, waitObj);
          getReplayDAOWaitObjectsLock().unlock();

          // Since the replay DAO doesn't exist, start up the service and
          // wait for a replay DAO to be registered by that service
          new Thread() {
            public void run() {
              getX().get(service);
              assertReplayDAORegistered_(service);
            }
          }.start();

          while ( ! waitObj.get() ) {
            try {
              getLogger().log("Waiting for "+service+"'s replay DAO");
              // Note: calling .wait() releases this synchronized block
              waitObj.wait();
            } catch ( InterruptedException e ) {
              // Interrupt invokes retry
              continue;
            }
          }
        }

        // If there is still no replay DAO, throw an exception
        if ( ! getReplayDAOs().containsKey(service) ) {
          throw new RuntimeException(String.format(
            "Service '%s' registered a replayDAO, but the RoutingJournal " +
            "instance for the shared journal named '%s' could not find it.",
            service, getFilename()));
        }

        return getReplayDAOs().get(service);
      `
    },
    {
      name: 'registerReplayDAO',
      args: [
        { name: 'service', type: 'String' },
        { name: 'replayDAO', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        getLogger().log("Received "+service+"'s replay DAO");
        getReplayDAOs().put(service, replayDAO);
        getReplayDAOWaitObjectsLock().lock();
        if ( getReplayDAOWaitObjects().containsKey(service) ) {
          getReplayDAOWaitObjectsLock().unlock();
          AtomicBoolean waitObj = getReplayDAOWaitObjects().get(service);
          synchronized ( waitObj ) {
            waitObj.set(true);
            waitObj.notifyAll();
          }
        } else {
          getReplayDAOWaitObjects().put(service, new AtomicBoolean(true));
          getReplayDAOWaitObjectsLock().unlock();
        }
      `
    },
    {
      name: 'replay',
      javaCode: `
        // count number of lines successfully read
        int successReading = 0;
        JSONParser parser = getParser();

        try ( BufferedReader reader = getReader() ) {
          if ( reader == null ) {
            return;
          }
          for ( String line ; ( line = reader.readLine() ) != null ; ) {
            if ( SafetyUtil.isEmpty(line) ) continue;
            if ( COMMENT.matcher(line).matches()    ) continue;

            try {
              String[] split = line.split("\\\\.", 2);
              if ( split.length != 2 ) {
                continue;
              }

              String service = split[0];
              line = split[1];

              char operation = line.charAt(0);
              int length = line.trim().length();
              line = line.trim().substring(2, length - 1);

              DAO dao = getReplayDAO_(service);
              foam.core.FObject obj = parser.parseString(line);
              if ( obj == null ) {
                getLogger().error("Parse error", getParsingErrorMessage(line), "line:", line);
                continue;
              }

              switch (operation) {
                case 'p':
                  foam.core.FObject old = dao.find(obj.getProperty("id"));
                  dao.put(old != null ? mergeFObject(old, obj) : obj);
                  break;

                case 'r':
                  dao.remove(obj);
                  break;
              }

              successReading++;
            } catch ( Throwable t ) {
              getLogger().error("Error replaying journal line:", line, t);
            }
          }
        } catch ( Throwable t ) {
          getLogger().error("Failed to read from journal", t);
        } finally {
          getLogger().log("Successfully read " + successReading + " entries from file: " + getFilename());
          setReplayed(true);
        }
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'SharedJournalFactorySingleton',

  // Note: this currently doesn't work on Java side; using context instead
  axioms: [ foam.pattern.Singleton.create() ],

  javaImports: [
    'foam.dao.Journal'
  ],

  properties: [
    {
      name: 'sharedJournalFiles',
      class: 'Map',
      javaType: 'java.util.Map<String, RoutingFileJournal>',
      javaFactory: `return new java.util.HashMap<String, RoutingFileJournal>();`
    }
  ],

  methods: [
    {
      name: 'getRoutingJournal',
      type: 'RoutingFileJournal',
      documentation: `
        Returns the instance of RoutingJournal corresponding to the specified
        journal file, creating the instance if it doesn't exist yet.`,
      args: [
        {
          name: 'name',
          type: 'String'
        }
      ],
      javaCode: `

        RoutingFileJournal routingJrl;

        synchronized ( this ) {
          if ( getSharedJournalFiles().containsKey(name) ) {
            return getSharedJournalFiles().get(name);
          }

          routingJrl = new RoutingFileJournal.Builder(getX())
            .setFilename(name)
            .setCreateFile(true)
            .build();

          getSharedJournalFiles().put(name, routingJrl);
        }

        new Thread() {
          public void run() {
            routingJrl.replay(getX());
          }
        }.start();

        return routingJrl;
      `
    },
    {
      name: 'getJournal',
      type: 'foam.dao.Journal',
      documentation: `
        This is the method all services should call to get a shared journal.`,
      args: [
        {
          name: 'name',
          type: 'String',
          documentation: `specifies a shared journal file`
        },
        {
          name: 'service',
          type: 'String',
          documentation: `
            specifies the service which the given replayDAO and returned
            Journal object are associated with`
        },
        {
          name: 'replayDAO',
          type: 'foam.dao.DAO',
          documentation: `
            specifies a DAO that will be populated during replay, allowing the
            service to block its initialization until replay is completed.`
        }
      ],
      javaCode: `
        RoutingFileJournal routingJrl = getRoutingJournal(name);
        routingJrl.registerReplayDAO(service, replayDAO);
        routingJrl.waitForReplay();
        Journal jrl =
          new JournalRoutingJournalAdapter.Builder(getX())
            .setDelegate(routingJrl)
            .setServiceName(service)
            .build();
        return jrl;
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'JournalRoutingJournalAdapter',
  implements: ['foam.dao.Journal'],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.RoutingJournal',
      name: 'delegate',
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        getDelegate().put_(x, getServiceName(), null, nu);
      `
    },
    {
      name: 'put_',
      javaCode: `
        getDelegate().put_(x, getServiceName(), old, nu);
      `
    },
    {
      name: 'remove',
      javaCode: `
        getDelegate().remove(x, getServiceName(), obj);
      `
    },
    {
      name: 'replay',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'dao', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        throw new RuntimeException(
          "Attempt to call .replay() on adapter to RoutingJournal"
        );
      `
    }
  ]
});
