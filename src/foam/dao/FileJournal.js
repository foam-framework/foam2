/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FileJournal',
  extends: 'foam.dao.AbstractJournal',
  flags: ['java'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.ProxyX',
    'foam.lib.json.ExprParser',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.json.OutputterMode',
    'foam.lib.parse.*',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.User',
    'foam.nanos.fs.Storage',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.InputStreamReader',
    'java.io.File',
    'java.io.FileReader',
    'java.io.FileWriter',
    'java.text.SimpleDateFormat',
    'java.util.Calendar',
    'java.util.Iterator',
    'java.util.List',
    'java.util.TimeZone',
    'java.util.regex.Pattern'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected static Pattern COMMENT = Pattern.compile("(/\\\\*([^*]|[\\\\r\\\\n]|(\\\\*+([^*/]|[\\\\r\\\\n])))*\\\\*+/)|(//.*)");

          protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
            @Override
            protected StringBuilder initialValue() {
              return new StringBuilder();
            }
            @Override
            public StringBuilder get() {
              StringBuilder b = super.get();
              b.setLength(0);
              return b;
            }
          };

          protected static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
            @Override
            protected SimpleDateFormat initialValue() {
              SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
              sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
              return sdf;
            }
          };
        `);
      }
    }
  ],

  properties: [
    {
      class: 'Object',
      name: 'outputter',
      javaType: 'foam.lib.json.Outputter',
      javaFactory: `
      Outputter out = new Outputter(OutputterMode.STORAGE);
      out.setX(getX());
      return out;`
    },
    {
      class: 'Object',
      name: 'parser',
      javaType: 'foam.lib.json.JSONParser',
      javaFactory: `return getX().create(JSONParser.class);`
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        if ( logger == null ) {
          logger = new StdoutLogger();
        }
        return new PrefixLogger(new Object[] { "[JDAO]", getFilename() }, logger);
      `
    },
    {
      class: 'String',
      name: 'filename',
      required: true
    },
    {
      class: 'Boolean',
      name: 'createFile',
      documentation: 'Flag to create file if not present',
      value: true,
    },
    {
      class: 'Object',
      name: 'file',
      javaType: 'java.io.File',
      javaFactory: `
        try {
          getLogger().log("Loading file: " + getFilename());
          File file = getX().get(Storage.class).get(getFilename());
          if ( ! file.exists() ) {
            getLogger().warning("Journal not found:" + getFilename());

            if ( getCreateFile() ) {
              // if output journal does not exist, create one
              File dir = file.getAbsoluteFile().getParentFile();
              if ( ! dir.exists() ) {
                getLogger().log("Create dir: " + dir.getAbsolutePath());
                dir.mkdirs();
              }

              getLogger().log("Create file: " + getFilename());
              file.getAbsoluteFile().createNewFile();
            }
          }
          return file;
        } catch ( Throwable t ) {
          getLogger().error("Failed to read from journal", t);
          throw new RuntimeException(t);
        }
      `
    },
    // reader uses a getter because we want a new reader on file replay
    {
      class: 'Object',
      name: 'reader',
      javaType: 'java.io.BufferedReader',
      javaGetter: `
      try {
        Storage storage = (Storage) getX().get(Storage.class);
        if ( storage.isResource() ) {
          return new BufferedReader(new InputStreamReader(storage.getResourceAsStream(getFilename())));
        } else {
          return new BufferedReader(new FileReader(getFile()));
        }
      } catch ( Throwable t ) {
        getLogger().error("Failed to read from journal", t);
        throw new RuntimeException(t);
      }
      `
    },
    // writer uses a factory because we want to use one writer for the lifetime of this journal object
    {
      class: 'Object',
      name: 'writer',
      javaType: 'java.io.BufferedWriter',
      javaFactory: `
        try {
          BufferedWriter writer = new BufferedWriter(new FileWriter(getFile(), true), 16 * 1024);
          writer.newLine();
          return writer;
        } catch ( Throwable t ) {
          getLogger().error("Failed to create writer", t);
          throw new RuntimeException(t);
        }
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      synchronized: true,
      javaCode: `
        try {
          String record = ( old != null ) ?
            getOutputter().stringifyDelta(old, nu) :
            getOutputter().stringify(nu);

          if ( ! foam.util.SafetyUtil.isEmpty(record) ) {
            writeComment_(x, nu);
            write_(sb.get()
              .append("p(")
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
      synchronized: true,
      javaCode: `
        try {
          // TODO: Would be more efficient to output the ID portion of the object.  But
          // if ID is an alias or multi part id we should only output the
          // true properties that ID/MultiPartID maps too.
          FObject toWrite = (FObject) obj.getClassInfo().newInstance();
          toWrite.setProperty("id", obj.getProperty("id"));
          String record = getOutputter().stringify(toWrite);

          if ( ! foam.util.SafetyUtil.isEmpty(record) ) {
            writeComment_(x, obj);
            write_(sb.get()
              .append("r(")
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
      name: 'write_',
      synchronized: true,
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          class: 'String',
          name: 'data'
        }
      ],
      javaCode: `
        BufferedWriter writer = getWriter();
        writer.write(data);
        writer.newLine();
        writer.flush();
      `
    },
    {
      name: 'writeComment_',
      synchronized: true,
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        if ( x.get("user") == null || ((User) x.get("user")).getId() <= 1 ) return;
        if ( obj instanceof LastModifiedByAware && ((LastModifiedByAware) obj).getLastModifiedBy() != 0L ) return;

        User user = (User) x.get("user");
        Calendar now = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        write_(sb.get()
          .append("// Modified by ")
          .append(user.label())
          .append(" (")
          .append(user.getId())
          .append(") at ")
          .append(sdf.get().format(now.getTime()))
          .toString());
      `
    },
    {
      name: 'replay',
      documentation: 'Replays the journal file',
      javaCode: `
        // count number of lines successfully read
        int successReading = 0;
        JSONParser parser = getParser();

        try ( BufferedReader reader = getReader() ) {
          for ( String line ; ( line = reader.readLine() ) != null ; ) {
            if ( SafetyUtil.isEmpty(line)        ) continue;
            if ( COMMENT.matcher(line).matches() ) continue;

            try {
              char operation = line.charAt(0);
              int length = line.trim().length();
              line = line.trim().substring(2, length - 1);

              FObject obj = parser.parseString(line);
              if ( obj == null ) {
                getLogger().error("Parse error", getParsingErrorMessage(line), "line:", line);
                continue;
              }

              switch ( operation ) {
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
        } catch ( Throwable t) {
          getLogger().error("Failed to read from journal", t);
        } finally {
          getLogger().log("Successfully read " + successReading + " entries from file: " + getFilename());
        }
      `
    },
    {
      name: 'getParsingErrorMessage',
      documentation: 'Gets the result of a failed parsing of a journal line',
      type: 'String',
      args: [
        {
          class: 'String',
          name: 'line'
        }
      ],
      javaCode: `
        Parser        parser = new ExprParser();
        PStream       ps     = new StringPStream();
        ParserContext x      = new ParserContextImpl();

        ((StringPStream) ps).setString(line);
        x.set("X", ( getX() == null ) ? new ProxyX() : getX());

        ErrorReportingPStream eps = new ErrorReportingPStream(ps);
        ps = eps.apply(parser, x);
        return eps.getMessage();
      `
    },
    {
      name: 'mergeFObject',
      type: 'foam.core.FObject',
      documentation: 'Add diff property to old property',
      args: [
        {
          name: 'oldFObject',
          type: 'FObject'
        },
        {
          name: 'diffFObject',
          type: 'FObject'
        }
      ],
      javaCode: `
        //get PropertyInfos
        List list = oldFObject.getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator e = list.iterator();

        while( e.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) e.next();
          mergeProperty(oldFObject, diffFObject, prop);
        }
        return oldFObject;
      `
    },
    {
      name: 'mergeProperty',
      args: [
        {
          name: 'oldFObject',
          type: 'FObject'
        },
        {
          name: 'diffFObject',
          type: 'FObject'
        },
        {
          name: 'prop',
          javaType: 'foam.core.PropertyInfo'
        }
      ],
      javaCode: `
        if ( prop.isSet(diffFObject) ) {
          prop.set(oldFObject, prop.get(diffFObject));
        }
      `
    }
  ]
});
