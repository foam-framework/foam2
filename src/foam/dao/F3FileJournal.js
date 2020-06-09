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
    'java.io.BufferedReader'
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
        // count number of entries successfully read
        int successReading = 0;
        JSONParser parser = getParser();

        // NOTE: explicitly calling PM constructor as create only creates
        // a percentage of PMs, but we want all replay statistics
        PM pm = new PM(((foam.dao.AbstractDAO)dao).getOf(), "replay."+getFilename());

        try ( BufferedReader reader = getReader() ) {
          if ( reader == null ) {
            return;
          }
          for ( CharSequence entry ; ( entry = getEntry(reader) ) != null ; ) {
            int length = entry.length();
            if ( length == 0 ) continue;
            if ( COMMENT.matcher(entry).matches() ) continue;

            try {
              char operation = entry.charAt(0);
              String strEntry = entry.subSequence(2, length - 1).toString();

              FObject obj = parser.parseString(strEntry);
              if ( obj == null ) {
                getLogger().error("Parse error", getParsingErrorMessage(strEntry), "entry:", strEntry);
                continue;
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

              successReading++;
            } catch ( Throwable t ) {
              getLogger().error("Error replaying journal entry:", entry, t);
            }
          }
        } catch ( Throwable t) {
          getLogger().error("Failed to read from journal", t);
        } finally {
          pm.log(x);
          getLogger().log("Successfully read " + successReading + " entries from file: " + getFilename() +" in: "+pm.getTime()+"(ms)");
        }
      `
    }
  ]
});
