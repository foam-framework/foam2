/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'FileLogger',
  extends: 'foam.nanos.logger.AbstractLogger',
  implements: [ 'foam.nanos.NanoService' ],

  javaImports: [
    'java.io.IOException',
    'java.text.SimpleDateFormat',
    'java.util.logging.FileHandler',
    'java.util.logging.Formatter',
    'java.util.logging.Handler',
    'java.util.logging.Level',
    'java.util.logging.Logger',
    'java.util.logging.LogRecord'
  ],

  properties: [
    {
      name: 'logPath',
      class: 'String',
      javaValue: 'System.getProperty("LOG_HOME")'
    },
    {
      name: 'logger',
      class: 'Object',
      javaType: 'java.util.logging.Logger'
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode:
`setLogger(java.util.logging.Logger.getAnonymousLogger());
getLogger().setUseParentHandlers(false);
getLogger().setLevel(Level.ALL);

try {
  Handler handler = null;

  if ( getLogPath() == null ) {
    handler = new FileHandler("nano.log");
  } else {
    handler = new FileHandler(getLogPath() + "/nano.log");
  }

  handler.setFormatter(new CustomFormatter());
  getLogger().addHandler(handler);
} catch (IOException e) {}`
    },
    {
      name: 'combine',
      args: [
        {
          name: 'args',
          javaType: 'Object[]'
        }
      ],
      type: 'String',
      javaCode:
`StringBuilder str = sb.get();
  for ( Object n : args ) {
    str.append(',');
    str.append(formatArg(n));
  }
  return str.toString();`
    },
    {
      name: 'log',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: "getLogger().info(combine(args));"
    },
    {
      name: 'info',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: "getLogger().info(combine(args));"
    },
    {
      name: 'warning',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: "getLogger().warning(combine(args));"
    },
    {
      name: 'error',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: "getLogger().severe(combine(args));"
    },
    {
      name: 'debug',
      documentation: "Can't normally do .debug() with custom formatter: use fine instead.",
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: "getLogger().fine(combine(args));"
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: "return this.getClass().getSimpleName();"
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
`protected class CustomFormatter extends Formatter {
  foam.util.SyncFastTimestamper ts_ = new foam.util.SyncFastTimestamper();

  @Override
  public String format(LogRecord record) {
    int           lev = record.getLevel().intValue();
    String        msg = record.getMessage();
    StringBuilder str = sb.get();

    str.append(ts_.createTimestamp());
    str.append(',');

    // debug special case, fine level == 500
    if ( lev == 500 ) {
      str.append("DEBUG");
    } else {
      str.append(record.getLevel());
    }

    str.append(msg);
    str.append('\\n');
    return str.toString();
  }
}`
        }))
      }
    }
  ]
});
