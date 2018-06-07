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

  imports: [
    'logger'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.ProxyX',
    'foam.lib.json.ExprParser',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.parse.*',
    'foam.nanos.fs.Storage',
    'foam.nanos.logger.Logger',
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
    // reader uses a getter because we want a new reader on file replay
    {
      class: 'Object',
      name: 'reader',
      javaType: 'java.io.BufferedReader',
      javaGetter: `
        try {
          return new BufferedReader(new FileReader(getFile()));
        } catch ( Throwable t ) {
          ((Logger) getLogger()).error("Failed to read from journal", t);
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
          ((Logger) getLogger()).error("Failed to write to journal", t);
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
          ((Logger) getLogger()).error("Failed to write to journal", t);
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
      documentation: 'Replays the journal file'
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
                ((Logger) getLogger()).error("parse error", getParsingErrorMessage(line), "line:", line);
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
    }
  ]
});

