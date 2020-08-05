/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractF3FileJournal',
  abstract: true,
  flags: ['java'],

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.ProxyX',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.json.ExprParser',
    'foam.lib.json.JSONParser',
    'foam.lib.parse.*',
    'foam.lib.StoragePropertyPredicate',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger',
    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.InputStream',
    'java.io.InputStreamReader',
    'java.io.OutputStream',
    'java.io.OutputStreamWriter',
    'java.util.Calendar',
    'java.util.Iterator',
    'java.util.List',
    'java.util.regex.Pattern',
    'java.util.TimeZone'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected static Pattern COMMENT = Pattern.compile("(/\\\\*([^*]|[\\\\r\\\\n]|(\\\\*+([^*/]|[\\\\r\\\\n])))*\\\\*+/)|(//.*)");

          protected static ThreadLocal<JSONFObjectFormatter> formatter = new ThreadLocal<JSONFObjectFormatter>() {
            @Override
            protected JSONFObjectFormatter initialValue() {
              return new JSONFObjectFormatter();
            }
            @Override
            public JSONFObjectFormatter get() {
              JSONFObjectFormatter b = super.get();
              b.reset();
              b.setPropertyPredicate(new StoragePropertyPredicate());
              b.setOutputShortNames(true);
              return b;
            }
          };

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

          // used for reading, and is shared across threads
          protected StringBuilder stringBuilder = new StringBuilder();

          protected static ThreadLocal<foam.lib.json.JSONParser> jsonParser = new ThreadLocal<foam.lib.json.JSONParser>() {
            @Override
            protected foam.lib.json.JSONParser initialValue() {
              return new JSONParser();
            }
            @Override
            public JSONParser get() {
              JSONParser parser = super.get();
              return parser;
            }
          };
        `);
      }
    }
  ],

  properties: [
    {
      class: 'Object',
      name: 'line',
      javaType: 'foam.util.concurrent.AssemblyLine',
      javaFactory: 'return new foam.util.concurrent.SyncAssemblyLine(getX());'
    },
    {
      class: 'Object',
      name: 'timeStamper',
      javaType: 'foam.util.FastTimestamper',
      javaFactory: `return new foam.util.FastTimestamper();`
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
      name: 'multiLineOutput',
      value: false
    },
    {
      class: 'Boolean',
      name: 'createFile',
      documentation: 'Flag to create file if not present',
      value: true,
    },
    // reader uses a getter because we want a new reader on file replay
    {
      class: 'Object',
      name: 'reader',
      javaType: 'java.io.BufferedReader',
      javaGetter: `
try {
  InputStream is = getX().get(foam.nanos.fs.Storage.class).getInputStream(getFilename());
  if ( is == null ) {
    getLogger().error("File not found - journal: " + getFilename());
  }
  return (is == null) ? null : new BufferedReader(new InputStreamReader(is));
} catch ( Throwable t ) {
  getLogger().error("Failed to initialize reader on journal", getFilename(), t);
  throw new RuntimeException(t);
}
      `
    },
    // Writer uses a factory because we want to use one writer for the lifetime of this journal object
    {
      class: 'Object',
      name: 'writer',
      javaType: 'java.io.BufferedWriter',
      javaFactory: `
try {
  OutputStream os = getX().get(foam.nanos.fs.Storage.class).getOutputStream(getFilename());
  if ( os == null ) {
    getLogger().error("File not found - journal: " + getFilename());
  }
  return (os == null) ? null : new BufferedWriter(new OutputStreamWriter(os));
} catch ( Throwable t ) {
  getLogger().error("Failed to initialize writer on journal", getFilename(), t);
  throw new RuntimeException(t);
}
      `
    },
    {
      class: 'Long',
      name: 'lastUser'
    },
    {
      class: 'Long',
      name: 'lastTimestamp'
    }
  ],

  methods: [
    {
      name: 'put',
      type: 'FObject',
      args: [ 'Context x', 'String prefix', 'DAO dao', 'foam.core.FObject obj' ],
      javaCode: `
        final Object               id  = obj.getProperty("id");
        final ClassInfo            of  = dao.getOf();
        final JSONFObjectFormatter fmt = formatter.get();

        getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
          FObject old;

          public Object[] requestLocks() {
            return new Object[] { id };
          }

          public void executeUnderLock() {
            old = dao.find_(x, id);
            dao.put_(x, obj);
          }

          public void executeJob() {
            try {
              if ( old != null ) {
                fmt.outputDelta(old, obj, of);
              } else {
                fmt.output(obj, of);
              }
            } catch (Throwable t) {
              getLogger().error("Failed to write put entry to journal", t);
              fmt.reset();
            }
          }

          public void endJob(boolean isLast) {
            if ( fmt.builder().length() == 0 ) return;

            try {
              writeComment_(x, obj);
              writePut_(
                x,
                fmt.builder(),
                getMultiLineOutput() ? "\\n" : "",
                foam.util.SafetyUtil.isEmpty(prefix) ? "" : prefix + ".");

              if ( isLast ) getWriter().flush();
            } catch (Throwable t) {
              getLogger().error("Failed to write put entry to journal", t);
            }
          }
        });

        return obj;
      `
    },
    {
      name: 'writePut_',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [ 'Context x', 'CharSequence record', 'String c', 'String prefix' ],
      javaCode: `
      BufferedWriter writer = getWriter();
      writer.write(prefix);
      writer.write("p(");
      writer.append(record);
      writer.write(')');
      writer.write(c);
      writer.newLine();
      `
    },
    {
      name: 'remove',
      type: 'FObject',
      args: [ 'Context x', 'String prefix', 'DAO dao', 'foam.core.FObject obj' ],
      javaCode: `
      final Object id = obj.getProperty("id");
      JSONFObjectFormatter fmt = formatter.get();
      getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {

        public Object[] requestLocks() {
          return new Object[] { id };
        }

        public void executeUnderLock() {
          dao.remove_(x, obj);
        }

        public void executeJob() {
          try {
            // TODO: Would be more efficient to output the ID portion of the object.  But
            // if ID is an alias or multi part id we should only output the
            // true properties that ID/MultiPartID maps too.
            FObject toWrite = (FObject) obj.getClassInfo().newInstance();
            toWrite.setProperty("id", obj.getProperty("id"));
            fmt.output(toWrite, dao.getOf());
          } catch (Throwable t) {
            getLogger().error("Failed to write put entry to journal", t);
          }
        }

        public void endJob(boolean isLast) {
          if ( fmt.builder().length() == 0 ) return;

          try {
            writeComment_(x, obj);
            writeRemove_(x, fmt.builder(), foam.util.SafetyUtil.isEmpty(prefix) ? "" : prefix + ".");

            if ( isLast ) getWriter().flush();
          } catch (Throwable t) {
            getLogger().error("Failed to write put entry to journal", t);
          }
        }
      });

      return obj;
      `
    },
    {
      name: 'writeRemove_',
      javaThrows: [
        'java.io.IOException'
      ],
      args: ['Context x', 'CharSequence record', 'String prefix' ],
      javaCode: `
      write_(sb.get()
        .append(prefix)
        .append("r(")
        .append(record)
        .append(")"));
      getWriter().newLine();
      `
    },
    {
      name: 'write_',
      javaThrows: [
        'java.io.IOException'
      ],
      args: ['CharSequence data'],
      javaCode: `
        BufferedWriter writer = getWriter();
        writer.append(data);
      `
    },
    {
      name: 'writeComment_',
     // synchronized: true,
      javaThrows: [
        'java.io.IOException'
      ],
      args: [ 'Context x', 'foam.core.FObject obj' ],
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null || user.getId() <= 1 ) return;
        if ( obj instanceof LastModifiedByAware && ((LastModifiedByAware) obj).getLastModifiedBy() != 0L ) return;
        long now    = System.currentTimeMillis();
        long userId = user.getId();
        if ( now == getLastTimestamp() && userId == getLastUser() ) return;
        setLastTimestamp(now);
        setLastUser(userId);

        write_(sb.get()
          .append("// Modified by ")
          .append(user.toSummary())
          .append(" (")
          .append(userId)
          .append(") at ")
          .append(getTimeStamper().createTimestamp()));
        getWriter().newLine();
      `
    },
    {
      name: 'getEntry',
      documentation: 'retrieves a meaningful unit of text from the journal',
      type: 'CharSequence',
      args: [ 'BufferedReader reader' ],
      javaCode: `
        try {
          String line = reader.readLine();
          if ( line == null ) return null;
          if ( ! line.equals("p({") && ! line.equals("r({") ) return line;
          stringBuilder.setLength(0);
          stringBuilder.append(line);
          while( ! line.equals("})") ) {
            if ( (line = reader.readLine()) == null ) break;
            if ( line.equals("p({") ) {
              getLogger().error("Entry is not properly closed: " + stringBuilder.toString());
            }
            stringBuilder.append("\\n");
            stringBuilder.append(line);
          }
          return stringBuilder;
        } catch (Throwable t) {
          getLogger().error("Failed to read from journal", t);
          return null;
        }
      `
    },
    {
      name: 'getParsingErrorMessage',
      documentation: 'Gets the result of a failed parsing of a journal line',
      type: 'CharSequence',
      args: [ 'String line' ],
      javaCode: `
        Parser        parser = ExprParser.instance();
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
      args: ['FObject oldFObject', 'FObject diffFObject' ],
      javaCode: `
        //get PropertyInfos
        List list = oldFObject.getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator e = list.iterator();

        while( e.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) e.next();
          mergeProperty(oldFObject, diffFObject, prop);
        }
        return diffFObject.copyFrom(oldFObject);
      `
    },
    {
      name: 'mergeProperty',
      args: [ 'FObject oldFObject', 'FObject diffFObject', 'foam.core.PropertyInfo prop' ],
      javaCode: `
        if ( prop.isSet(diffFObject) ) {
          prop.set(oldFObject, prop.get(diffFObject));
        }
      `
    }
  ]
});
