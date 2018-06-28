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
    'foam.lib.json.OutputterMode',
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
    'java.util.regex.Pattern'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected Pattern COMMENT = Pattern.compile("(/\\\\*([^*]|[\\\\r\\\\n]|(\\\\*+([^*/]|[\\\\r\\\\n])))*\\\\*+/)|(//.*)");
          protected Outputter outputter_ = new Outputter(OutputterMode.STORAGE);
        `);
      }
    }
  ],

  properties: [
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
      synchronized: true,
      javaCode: `
        FObject fobj = (FObject) obj;
        PropertyInfo id = (PropertyInfo) fobj.getClassInfo().getAxiomByName("id");
        FObject old = getDao().find(id.get(obj));
        String record = ( old != null ) ?
          outputter_.stringifyDelta(old.fclone(), fobj) :
          outputter_.stringify(fobj);
        write_("p(" + record + ")");
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
          FObject fobj = (FObject) obj;
          FObject toWrite = (FObject) fobj.getClassInfo().getObjClass().newInstance();
          PropertyInfo id = (PropertyInfo) fobj.getClassInfo().getAxiomByName("id");
          id.set(toWrite, id.get(obj));
          write_("r(" + outputter_.stringify(toWrite) + ")");
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
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
                  PropertyInfo id = (PropertyInfo) dao.getOf().getAxiomByName("id");
                  FObject old = dao.find(id.get(object));
                  if ( old != null ) {
                    // merge difference
                    object = mergeFObject(old.fclone(), object);
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
            }
          }
        } catch ( Throwable t) {
          getLogger().error("failed to read from journal", t);
        } finally {
          getLogger().log("Successfully read " + successReading + " entries from file: " + getFilename());
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
      name: 'mergeFObject',
      javaReturns: 'foam.core.FObject',
      documentation: 'Add diff property to old property',
      args: [
        {
          class: 'FObjectProperty',
          name: 'oldFObject',
        },
        {
          class: 'FObjectProperty',
          name: 'diffFObject'
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
          class: 'FObjectProperty',
          name: 'oldFObject',
        },
        {
          class: 'FObjectProperty',
          name: 'diffFObject'
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


foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyFileJournal',
  extends: 'foam.dao.FileJournal',

  documentation: 'Write Only implementation of file journal',

  methods: [
    {
      name: 'replay',
      javaCode: ``
    }
  ]
});
