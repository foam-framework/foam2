/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractFileJournal',
  abstract: true,
  flags: ['java'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.ProxyX',
    'foam.lib.StoragePropertyPredicate',
    'foam.lib.json.ExprParser',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.parse.*',
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
        `);
      }
    }
  ],

  properties: [
    {
      class: 'Object',
      name: 'line',
      javaType: 'foam.util.concurrent.AssemblyLine',
      javaFactory: 'return new foam.util.concurrent.SyncAssemblyLine();'
    },
    {
      class: 'Object',
      name: 'outputter',
      javaType: 'foam.lib.json.Outputter',
      javaFactory: `
        foam.lib.json.Outputter outputter = new Outputter(getX()).setPropertyPredicate(new StoragePropertyPredicate());
        outputter.setMultiLine(getMultiLineOutput());
        return outputter;
        `
    },
    {
      class: 'Object',
      name: 'parser',
      javaType: 'foam.lib.json.JSONParser',
      javaFactory: `return getX().create(JSONParser.class);`
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
  getLogger().error("Failed to read from journal: " + getFilename(), t);
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
  getLogger().error("Failed to read from journal: " + getFilename(), t);
  throw new RuntimeException(t);
}
      `
    }
  ],

  methods: [
    {
      name: 'put',
      type: 'FObject',
      args: [
        { name: 'x',      type: 'Context' },
        { name: 'prefix', type: 'String' },
        { name: 'dao',    type: 'DAO' },
        { name: 'obj',    type: 'foam.core.FObject' }
      ],
      javaCode: `
        final Object id = obj.getProperty("id");

        getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
          FObject old;
          String  record_ = null;

          public Object[] requestLocks() {
            return new Object[] { id };
          }

          public void executeUnderLock() {
            old = dao.find_(x, id);
            dao.put_(x, obj);
          }

          public void executeJob() {}

          public void endJob() {
            try {
              record_ = ( old != null ) ?
                getOutputter().stringifyDelta(old, obj) :
                getOutputter().stringify(obj);
            } catch (Throwable t) {
              getLogger().error("Failed to write put entry to journal", t);
              record_ = null;
            }

            if ( foam.util.SafetyUtil.isEmpty(record_) ) return;

            try {
              writeComment_(x, obj);
              writePut_(
                x,
                record_,
                getMultiLineOutput() ? "\\n" : "",
                foam.util.SafetyUtil.isEmpty(prefix) ? "" : prefix + ".");

                if ( isLast() ) getWriter().flush();
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
        },
        {
          name: 'prefix',
          type: 'String'
        }
      ],
      javaCode: `
        write_(sb.get()
          .append(prefix)
          .append("p(")
          .append(record)
          .append(")")
          .append(c)
          .toString());
      `
    },
    {
      name: 'remove',
      type: 'FObject',
      args: [
        { name: 'x',      type: 'Context' },
        { name: 'prefix', type: 'String' },
        { name: 'dao',    type: 'DAO' },
        { name: 'obj',    type: 'foam.core.FObject' }
      ],
      javaCode: `
      final Object id = obj.getProperty("id");

      getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
        String record_ = null;

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
            record_ = getOutputter().stringify(toWrite);
          } catch (Throwable t) {
            getLogger().error("Failed to write put entry to journal", t);
          }
        }

        public void endJob() {
          if ( foam.util.SafetyUtil.isEmpty(record_) ) return;

          try {
            writeComment_(x, obj);
            writeRemove_(x, record_, foam.util.SafetyUtil.isEmpty(prefix) ? "" : prefix + ".");

            if ( isLast() ) getWriter().flush();
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
          name: 'prefix',
          type: 'String'
        }
      ],
      javaCode: `
        write_(sb.get()
          .append(prefix)
          .append("r(")
          .append(record)
          .append(")")
          .toString());
      `
    },
    {
      name: 'write_',
     // synchronized: true,
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
      `
    },
    {
      name: 'writeComment_',
     // synchronized: true,
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
        User user = ((Subject) x.get("subject")).getUser();
        if ( user == null || user.getId() <= 1 ) return;
        if ( obj instanceof LastModifiedByAware && ((LastModifiedByAware) obj).getLastModifiedBy() != 0L ) return;

        write_(sb.get()
          .append("// Modified by ")
          .append(user.toSummary())
          .append(" (")
          .append(user.getId())
          .append(") at ")
          .append(getTimeStamper().createTimestamp())
          .toString());
      `
    },
    {
      name: 'getEntry',
      documentation: 'retrieves ameaningful unit of text from the journal',
      type: 'String',
      args: [
        {
          name: 'reader',
          type: 'BufferedReader'
        }
      ],
      javaCode: `
        try {
          String line = reader.readLine();
          if ( line == null ) return null;
          if ( ! line.equals("p({") && ! line.equals("r({") ) return line;
          StringBuilder sb = new StringBuilder();
          sb.append(line);
          while( ! line.equals("})") ) {
            if ( (line = reader.readLine()) == null ) break;
            sb.append("\\n");
            sb.append(line);
          }
          return sb.toString().trim();
        } catch (Throwable t) {
          getLogger().error("Failed to read from journal", t);
          return null;
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
        return diffFObject.copyFrom(oldFObject);
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
