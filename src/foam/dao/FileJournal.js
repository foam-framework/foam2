/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FileJournal',
  extends: 'foam.dao.AbstractFileJournal',
  flags: ['java'],

  implements: [
    'foam.dao.Journal'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.lib.json.JSONParser',
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

        try ( BufferedReader reader = getReader() ) {
          if ( reader == null ) {
            return;
          }
          for ( String entry ; ( entry = getEntry(reader) ) != null ; ) {
            if ( SafetyUtil.isEmpty(entry)        ) continue;
            if ( COMMENT.matcher(entry).matches() ) continue;

            try {
              char operation = entry.charAt(0);
              int length = entry.length();
              entry = entry.substring(2, length - 1);

              FObject obj = parser.parseString(entry);
              if ( obj == null ) {
                getLogger().error("Parse error", getParsingErrorMessage(entry), "entry:", entry);
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
          getLogger().log("Successfully read " + successReading + " entries from file: " + getFilename());
        }
      `
    }
  ]
});
