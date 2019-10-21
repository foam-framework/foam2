/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RoutingJournal',
  extends: 'foam.dao.FileJournal',

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
      name: 'writePut_',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'record',
          type: 'String'
        },
        {
          name: 'c',
          type: 'String'
        }
      ],
      javaCode: `
        String service = (String) x.get("service");
        write_(sb.get()
          .append(service)
          .append(".p(")
          .append(record)
          .append(")")
          .toString());
      `
    },
    {
      name: 'writeRemove_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'record',
          type: 'String'
        }
      ],
      javaCode: `
        String service = (String) x.get("service");
        write_(sb.get()
          .append(service)
          .append(".r(")
          .append(record)
          .append(")")
          .toString());
      `
    },
    {
      name: 'replay',
      javaCode: `
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
