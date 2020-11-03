/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'F3FileJournal',
  extends: 'foam.dao.AbstractF3FileJournal',
  flags: ['java'],

  implements: [
    'foam.dao.Journal'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.lib.json.JSONParser',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'foam.util.concurrent.AssemblyLine',
    'java.util.concurrent.atomic.AtomicInteger'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    }
  ],

  methods: [
    {
      name: 'replay',
      documentation: 'Replays the journal file',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'dao', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        JSONParser parser = (JSONParser) getParser(x);

        // count number of entries successfully read
        AtomicInteger successReading = new AtomicInteger();
        AtomicInteger failedReading = new AtomicInteger();

        // NOTE: explicitly calling PM constructor as create only creates
        // a percentage of PMs, but we want all replay statistics
        PM pm = new PM(this.getClass().getSimpleName(), ((foam.dao.AbstractDAO)dao).getOf().getId(), "replay", getFilename());

        try ( BufferedReader reader = getReader() ) {
          if ( reader == null ) {
            return;
          }
          Class defaultClass = dao.getOf().getObjClass();
          for (  CharSequence entry ; ( entry = getEntry(reader) ) != null ; ) {
            int length = entry.length();
            if ( length == 0 ) continue;
            if ( COMMENT.matcher(entry).matches() ) continue;
            try {
              final char operation = entry.charAt(0);
              final String strEntry = entry.subSequence(2, length - 1).toString();
              FObject obj = parser.parseString(strEntry, defaultClass);
              if ( obj == null ) {
                getLogger().error("Parse error", getParsingErrorMessage(strEntry), "entry:", strEntry);
                return;
              }
              switch ( operation ) {
                case 'p':
                  foam.core.FObject old = dao.find(obj.getProperty("id"));
                  dao.put(old != null ? mergeFObject(old.fclone(), obj) : obj);
                  break;

                case 'r':
                  dao.remove(obj);
                  break;
              }
              successReading.incrementAndGet();
            } catch ( Throwable t ) {
              getLogger().error("Error replaying journal entry:", entry, t);
              failedReading.incrementAndGet();
            }
          }
        } catch ( Throwable t) {
          pm.error(x, t);
          getLogger().error("Failed to read from journal", t);
          throw new RuntimeException(t);
        } finally {
          if ( failedReading.get() > 0 ) {
            getLogger().warning("Failed to read " + failedReading.get() + " entries from file: " + getFilename());
            pm.error(x, "Failed to read " + failedReading.get() + " entries");
          } else {
            pm.log(x);
          }
          getLogger().info("Successfully read " + successReading.get() + " entries from file: " + getFilename() + " in: " + pm.getTime() + "(ms)");
        }
      `
    }
  ]
});
