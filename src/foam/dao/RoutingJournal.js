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
    'java.io.BufferedReader'
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
        putWithPrefix_(x, old, nu, dest);
      `
    },
    {
      name: 'remove',
      javaCode: `
        removeWithPrefix_(x, obj, dest);
      `
    },
    {
      name: 'replay',
      javaCode: `
        // count number of lines successfully read
        int successReading = 0;
        JSONParser parser = getParser();

        try ( BufferedReader reader = getReader() ) {
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

              DAO dao = (DAO) x.get(service);
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

  axioms: [ foam.pattern.Singleton.create() ],

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
      name: 'get',
      type: 'RoutingFileJournal',
      synchronized: true,
      args: [
        {
          name: 'name',
          type: 'String'
        }
      ],
      javaCode: `
        if ( getSharedJournalFiles().containsKey(name) ) {
          return getSharedJournalFiles().get(name);
        }

        RoutingFileJournal routingJrl = new RoutingFileJournal.Builder(getX())
          .setFilename(name)
          .setCreateFile(true)
          .build();
        getSharedJournalFiles().put(name, routingJrl);
        return routingJrl;
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
