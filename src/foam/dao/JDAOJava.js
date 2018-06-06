/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  refines: 'foam.dao.Journal',

  methods: [
    {
      name: 'replay',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'dao',
          javaType: 'foam.dao.DAO'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'FileJournal',

  implements: [
    'foam.dao.Journal'
  ],

  imports: [
    'logger'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.nanos.fs.Storage',
    'foam.util.SafetyUtil',

    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.File',
    'java.io.FileReader',
    'java.io.FileWriter',
    'java.util.regex.Pattern',

    'static foam.lib.json.OutputterMode.STORAGE'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(foam.java.Code.create({
          data: `protected Pattern COMMENT = Pattern.compile("(/\\\\*([^*]|[\\\\r\\\\n]|(\\\\*+([^*/]|[\\\\r\\\\n])))*\\\\*+/)|(//.*)");`
        }))
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'filename',
      required: true
    },
    {
      class: 'Object',
      name: 'file',
      javaType: 'java.io.File',
      javaFactory: `
        try {
          File file = getX().get(Storage.class).get(getFilename());
          if ( ! file.exists() ) {
            file.createNewFile();
          }
          return file;
        } catch ( Throwable t ) {
          throw new RuntimeException("Failed to create journal");
        }
      `
    },
    {
      class: 'Object',
      name: 'reader',
      javaType: 'java.io.BufferedReader',
      javaFactory: `
        try {
          return new BufferedReader(new FileReader(getFile()));
        } catch ( Throwable t ) {
          throw new RuntimeException("Failed to read from journal");
        }
      `
    },
    {
      class: 'Object',
      name: 'writer',
      javaType: 'java.io.BufferedWriter',
      javaFactory: `
        try {
          return new BufferedWriter(new FileWriter(getFile()));
        } catch ( Throwable t ) {
          throw new RuntimeException("Failed to write to journal");
        }
      `
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `write_("p(" + new Outputter(STORAGE).stringify((FObject) obj) + ")");`
    },
    {
      name: 'remove',
      javaCode: `write_("r(" + new Outputter(STORAGE).stringify((FObject) obj) + ")");`
    },
    {
      name: 'write_',
      synchronized: true,
      args: [
        {
          class: 'String',
          name: 'data'
        }
      ],
      javaCode: `
        try ( BufferedWriter writer = getWriter() ) {
          writer.write(data);
          writer.newLine();
          writer.flush();
        } catch ( Throwable t ) {
          throw new RuntimeException("Failed to write to journal");
        }
      `
    },
    {
      name: 'eof'
    },
    {
      name: 'reset'
    },
    {
      name: 'replay',
      javaCode: `
        JSONParser parser = getX().create(JSONParser.class);

        try ( BufferedReader reader = getReader() ) {
          for ( String line ; ( line = reader.readLine() ) != null ; ) {
            if ( SafetyUtil.isEmpty(line)        ) continue;
            if ( COMMENT.matcher(line).matches() ) continue;

            try {
              char operation = line.charAt(0);
              int length = line.trim().length();
              line = line.trim().substring(2, length - 1);

              FObject object = parser.parseString(line);
              if ( object == null ) {
                ((Logger) getLogger()).error("parse error", "line:", line);
                continue;
              }

              switch ( operation ) {
                case 'p':
                  dao.put(object);
                  break;

                case 'r':
                  dao.remove(object);
                  break;
              }
            } catch ( Throwable t ) {
              ((Logger) getLogger()).error("error replaying journal line:", line, t);
            }
          }
        } catch ( Throwable t) {
          ((Logger) getLogger()).error("failed to read from journal", t);
        }

        return dao;
      `
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.JDAO',

  methods: [

  ]
});
