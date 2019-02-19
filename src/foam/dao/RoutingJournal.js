/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RoutingJournal',
  extends: 'foam.dao.FileJournal',

  documentation:
    `Journal interface that prepends the DAO name to the journal entry so that
      one may use a single journal file and still be able to put the entry into
      the correct DAO.`,

  properties: [
    {
      class: 'Boolean',
      name: 'replayed',
      documentation: 'If replayed is true, this will unblock anything waiting.',
      javaPostSet: `
        waitForReplay();
      `
    }
  ],

  methods: [
    {
      name: 'waitForReplay',
      synchronized: true,
      documentation: `By default Booleans are set to false in FOAM. This method
        will ask all calling threads to wait until the journal is read, and
        notify them once it is.`,
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
      name: 'put_',
      documentation: `Prepend the service name (set in RoutingJDAO in context)
        prior to putting in the journal.`,
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
          getLogger().error("RoutingJournal :: Failed to write put entry to the journal.", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'remove',
      documentation: `Prepend the service name (set in RoutingJDAO in context)
        prior to adding a remove in the journal.`,
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
          getLogger().error("RoutingJournal :: Failed to write remove entry to the journal.", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'replay',
      documentation: `Replaying the journal.`,
      javaCode: `
        /* Adding the current object to the context so that the puts initiated
          on replay will have it in their context. In RoutingJDAO, this is used
          to distinguish between a regular put and a replaying put. */
        x = x.put("replayingJournal", this);

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
              foam.core.FObject obj = parser.parseString(line);
              if ( obj == null ) {
                getLogger().error("Parse error", getParsingErrorMessage(line), "line:", line);
                continue;
              }

              switch (operation) {
                case 'p':
                  foam.core.FObject old = dao.inX(x).find(obj.getProperty("id"));
                  dao.inX(x).put(old != null ? mergeFObject(old, obj) : obj);
                  break;

                case 'r':
                  dao.inX(x).remove(obj);
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
