/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RoutingJournal',
  extends: 'foam.dao.FileJournal',

  documentation: `Journal interface that also adds the DAO name to the journal
    entry so that one may use a single journal file and still be able to put the
    entry into the correct DAO`,

  javaImports: [
    'foam.dao.java.FindJournalledDAO'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          // Boolean to check if the journal file is being or has been replayed
          protected volatile boolean journalReplayed_ = false;
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        try {
          String service = (String) x.get("service");
          String record = ( old != null ) ?
            getOutputter().stringifyDelta(old, nu) :
            getOutputter().stringify(nu);

          if ( ! foam.util.SafetyUtil.isEmpty(record) ) {
            writeComment_(x, nu);
            write_(sb.get()
              .append(service)
              .append(".p(")
              .append(record)
              .append(")")
              .toString());
          }
        } catch ( Throwable t ) {
          getLogger().error("Failed to write put entry to journal", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'remove',
      javaCode: `
        try {
          String service = (String) x.get("service");
          foam.core.FObject toWrite = (foam.core.FObject) obj.getClassInfo().newInstance();
          toWrite.setProperty("id", obj.getProperty("id"));
          String record = getOutputter().stringify(toWrite);

          if ( ! foam.util.SafetyUtil.isEmpty(record) ) {
            writeComment_(x, obj);
            write_(sb.get()
              .append(service)
              .append(".r(")
              .append(record)
              .append(")")
              .toString());
          }
        } catch ( Throwable t ) {
          getLogger().error("Failed to write remove entry to journal", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'replay',
      javaCode: `
        if ( ! journalReplayed_ ) {
          System.out.println("dhiren debug: replaying routingJournal!");
          journalReplayed_ = true;

          // count number of lines successfully read
          int successReading = 0;
          foam.lib.json.JSONParser parser = getParser();

          try ( java.io.BufferedReader reader = getReader() ) {
            for ( String line ; ( line = reader.readLine() ) != null ; ) {
              if ( foam.util.SafetyUtil.isEmpty(line) ) continue;
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

                dao = (foam.dao.DAO) x.get(service);
                System.out.println("dhiren debug: debug " + String.valueOf(dao instanceof FindJournalledDAO));
                foam.dao.java.JDAO delegateDAO = (foam.dao.java.JDAO) dao.cmd(new FindJournalledDAO(null));
                dao = delegateDAO != null ? delegateDAO.getDelegate() : dao;
                System.out.println("dhiren debug: debug 1!");
                foam.core.FObject obj = parser.parseString(line);
                if ( obj == null ) {
                  getLogger().error("Parse error", getParsingErrorMessage(line), "line:", line);
                  continue;
                }
                System.out.println("dhiren debug: debug 2!");
                switch (operation) {
                  case 'p':
                    foam.core.FObject old = dao.find(obj.getProperty("id"));
                    System.out.println("dhiren debug: debug 3!");
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
            journalReplayed_ = false;
          } finally {
            getLogger().log("Successfully read " + successReading + " entries from file: " + getFilename());
          }
        }
      `
    }
  ]
});
