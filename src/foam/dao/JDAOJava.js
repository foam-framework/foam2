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
  name: 'ProxyJournal',

  documentation: 'Proxy journal class',

  implements: [
    'foam.dao.Journal'
  ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.Journal',
      name: 'delegate',
      forwards: [ 'replay', 'put', 'remove', 'eof', 'reset' ]
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'CompositeJournal',

  documentation: 'Composite journal implementation',

  implements: [
    'foam.dao.Journal'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.dao.Journal',
      name: 'delegates'
    }
  ],

  methods: [
    {
      name: 'replay',
      javaCode: `
        for ( Journal delegate : getDelegates() ) {
          delegate.replay(dao);
        }
      `
    },
    {
      name: 'put',
      javaCode: `
        for ( Journal delegate : getDelegates() ) {
          delegate.put(obj, sub);
        }
      `
    },
    {
      name: 'remove',
      javaCode: `
        for ( Journal delegate : getDelegates() ) {
          delegate.remove(obj, sub);
        }
      `
    },
    {
      name: 'eof',
      javaCode: `
        for ( Journal delegate : getDelegates() ) {
          delegate.eof();
        }
      `
    },
    {
      name: 'reset',
      javaCode: `
        for ( Journal delegate : getDelegates() ) {
          delegate.reset(sub);
        }
      `
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'FileJournal',

  implements: [
    'foam.dao.Journal'
  ],

  javaImports: [
    'foam.core.AbstractFObjectPropertyInfo',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.ProxyX',
    'foam.lib.json.ExprParser',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.parse.*',
    'foam.nanos.fs.Storage',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.File',
    'java.io.FileReader',
    'java.io.FileWriter',
    'java.util.Iterator',
    'java.util.List',
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
      value: false,
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
            getLogger().warning("Can not find file: " + getFilename());

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
          return new BufferedReader(new FileReader(getFile()));
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
          getLogger().error("Failed to write to journal", t);
          throw new RuntimeException(t);
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
        try {
          BufferedWriter writer = getWriter();
          writer.write(data);
          writer.newLine();
          writer.flush();
        } catch ( Throwable t ) {
          getLogger().error("Failed to write to journal", t);
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
      documentation: 'Replays the journal file',
      javaCode: `
        // count number of lines successfully read
        int successReading = 0;
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
                getLogger().error("parse error", getParsingErrorMessage(line), "line:", line);
                continue;
              }

              switch ( operation ) {
                case 'p':
                  FObject old;
                  PropertyInfo id = (PropertyInfo) dao.getOf().getAxiomByName("id");
                  if ( ( old = dao.find(id.get(object)) ) != null ) {
                    // if object already in dao, merge the difference
                    object = mergeChange(old, object);
                  }

                  dao.put(object);
                  break;

                case 'r':
                  dao.remove(object);
                  break;
              }

              successReading++;
            } catch ( Throwable t ) {
              getLogger().error("error replaying journal line:", line, t);
            } finally {
              getLogger().log("Successfully read " + successReading + " entries from file: " + getFilename());
            }
          }
        } catch ( Throwable t) {
          getLogger().error("failed to read from journal", t);
        }
      `
    },
    {
      name: 'getParsingErrorMessage',
      documentation: 'Gets the result of a failed parsing of a journal line',
      javaReturns: 'String',
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
      name: 'mergeChange',
      javaReturns: 'foam.core.FObject',
      documentation: 'Merges two FObjects',
      args: [
        {
          class: 'FObjectProperty',
          name: 'o',
        },
        {
          class: 'FObjectProperty',
          name: 'c'
        }
      ],
      javaCode: `
        //if no change to merge, return FObject;
        if ( c == null ) return o;
        //merge change
        return mergeChange_(o, c);
      `
    },
    {
      name: 'mergeChange_',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          class: 'FObjectProperty',
          name: 'o',
        },
        {
          class: 'FObjectProperty',
          name: 'c'
        }
      ],
      javaCode: `
        if ( o == null ) return c;

        //get PropertyInfos
        List list = o.getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator e = list.iterator();

        while ( e.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) e.next();
          if ( prop instanceof AbstractFObjectPropertyInfo ) {
            //do nested merge
            //check if change
            if ( ! prop.isSet(c) ) continue;
            mergeChange_((FObject) prop.get(o), (FObject) prop.get(c));
          } else {
            //check if change
            if ( ! prop.isSet(c) ) continue;
            //set new value
            prop.set(o, prop.get(c));
          }
        }

        return o;
      `
    }
  ]
});

