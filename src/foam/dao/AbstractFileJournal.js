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
    'foam.lib.json.ExprParser',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.StoragePropertyPredicate',
    'foam.lib.parse.*',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.InputStreamReader',
    'java.io.InputStream',
    'java.io.OutputStream',
    'java.io.OutputStreamWriter',
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
    getLogger().error("Failed to read from resource journal: " + getFilename());
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
    getLogger().error("Failed to read from resource journal: " + getFilename());
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
      name: 'putWithPrefix_',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'old', type: 'foam.core.FObject' },
        { name: 'nu', type: 'foam.core.FObject' },
        { name: 'prefix', type: 'String' }
      ],
      synchronized: true,
      javaCode: `
        prefix = ( ! foam.util.SafetyUtil.isEmpty(prefix) )
          ? prefix + "."
          : "";
        try {
          String c = "";
          if ( getMultiLineOutput() )
            c = "\\n";

          String record = ( old != null ) ?
            getOutputter().stringifyDelta(old, nu) :
            getOutputter().stringify(nu);

          if ( ! foam.util.SafetyUtil.isEmpty(record) ) {
            writeComment_(x, nu);
            writePut_(x, record, c, prefix);
          }

        } catch ( Throwable t ) {
          getLogger().error("Failed to write put entry to journal", t);
          throw new RuntimeException(t);
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
      name: 'removeWithPrefix_',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'prefix', type: 'String' }
      ],
      synchronized: true,
      javaCode: `
        prefix = ( ! foam.util.SafetyUtil.isEmpty(prefix) )
          ? prefix + "."
          : "";
        try {
          // TODO: Would be more efficient to output the ID portion of the object.  But
          // if ID is an alias or multi part id we should only output the
          // true properties that ID/MultiPartID maps too.
          FObject toWrite = (FObject) obj.getClassInfo().newInstance();
          toWrite.setProperty("id", obj.getProperty("id"));
          String record = getOutputter().stringify(toWrite);

          if ( ! foam.util.SafetyUtil.isEmpty(record) ) {
            writeComment_(x, obj);
            writeRemove_(x, record, prefix);
          }
        } catch ( Throwable t ) {
          getLogger().error("Failed to write remove entry to journal", t);
          throw new RuntimeException(t);
        }
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
