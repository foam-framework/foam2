/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PM',

  documentation: `A Performance Measure which captures the count and duration of some event.`,

  implements: [
    'foam.nanos.analytics.Foldable',
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmConfig'
  ],

  ids: [ 'key', 'name', 'startTime' ],

  properties: [
    {
      class: 'String',
      name: 'key'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'startTime',
      class: 'Long',
      factory: function() {
        return Date.now();
      },
      javaFactory: `return System.currentTimeMillis();`
    },
    {
      name: 'endTime',
      class: 'Long'
    },
    {
      name: 'isError',
      class: 'Boolean',
      value: false
    },
    {
      name: 'errorMessage',
      class: 'String'
    },
    {
      name: 'exception',
      class: 'Object',
      storageTransient: true
    }
  ],

  methods: [
    {
      name: 'init_',
      javaCode: `
      getStartTime();
      `
    },
    {
      name: 'log',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'X'
        }
      ],
      javaCode: `
    if ( x == null ) return;
    if ( getIsError() ) return;
    if ( getEndTime() == 0L ) {
      setEndTime(System.currentTimeMillis());
    }
    PMLogger pmLogger = (PMLogger) x.get(DAOPMLogger.SERVICE_NAME);
    if ( pmLogger != null ) {
      pmLogger.log(this);
    }
      `
    },
    {
      name: 'getTime',
      type: 'Long',
      javaCode: `
    return getEndTime() - getStartTime();
      `
    },
    {
      name: 'doFolds',
      javaCode: `
    fm.foldForState(getKey()+":"+getName(), new java.util.Date(getStartTime()), getTime());
      `
    },
    {
      name: 'error',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'args', type: 'Object...' }
      ],
      javaCode: `
        setIsError(true);
        setEndTime(System.currentTimeMillis());
        StringBuilder sb = new StringBuilder();
        for (Object obj: args) {
          if ( obj instanceof Exception ) {
            setException(obj);
            sb.append(((Exception) obj).getMessage());
          } else {
            sb.append(obj);
          }
          sb.append(",");
        }
        if ( sb.length() > 0 ) {
          setErrorMessage(sb.deleteCharAt(sb.length() - 1).toString());
        }
        PMLogger pmLogger = (PMLogger) x.get(DAOPMLogger.SERVICE_NAME);
        if ( pmLogger != null ) {
          pmLogger.log(this);
        } else {
          System.err.println("PMLogger not found.");
          new Exception("PMLogger not found").printStackTrace();
        }
        `
    },
    {
      name: 'applyAction',
      javaCode: `
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              PM pm = (PM) obj;
              if ( ! pm.getIsError() ) {
                return;
              }
              ((DAO) x.get("alarmDAO")).put(new Alarm(pm.getKey(), true));
            }
          }, "PM alarm");
     `
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            public static PM create(X x, FObject fo, String... name) {
              PM pm = (PM) x.get("PM");

              if ( pm == null ) return new PM(fo, name);

              pm.setKey(fo.getClassInfo().getId());
              pm.setName(combine((Object[]) name));
              pm.init_();

              return pm;
            }

            public static PM create(X x, ClassInfo clsInfo, String... name) {
              PM pm = (PM) x.get("PM");

              if ( pm == null ) return new PM(clsInfo, name);

              pm.setKey(clsInfo.getId());
              pm.setName(combine((Object[]) name));
              pm.init_();

              return pm;
            }

            public static PM create(X x, Object key, Object... args) {
              PM pm = (PM) x.get("PM");

              if ( pm == null ) return new PM(key, args);

              pm.setKey(key.toString());
              pm.setName(combine((Object[]) args));
              pm.init_();

              return pm;
            }

            public PM(ClassInfo clsInfo, String... name) {
              setName(combine((Object[]) name));
              setKey(clsInfo.getId());
              init_();
            }

            public PM(Class cls, String... name) {
              setName(combine((Object[]) name));
              foam.core.ClassInfoImpl clsInfo = new foam.core.ClassInfoImpl();
              clsInfo.setObjClass(cls);
              clsInfo.setId(cls.getName());
              setKey(clsInfo.getId());
              init_();
            }

            public PM(FObject fo, String... name) {
              this(fo.getClassInfo(), name);
            }

            public PM(String... args) {
              if ( args.length > 0 ) {
                setKey(args[0]);
              }
              if ( args.length > 1 ) {
                setName(combine((Object[]) java.util.Arrays.copyOfRange(args, 1, args.length)));
              }
              init_();
            }

            public PM(Object... args) {
              if ( args.length > 0 ) {
                setKey(args[0].toString());
              }
              if ( args.length > 1 ) {
                setName(combine((Object[]) java.util.Arrays.copyOfRange(args, 1, args.length)));
              }
              init_();
            }

            public static String combine(Object... args) {
              if ( args == null ) return "";
              if ( args.length == 0 || args[0] == null ) return "";
              if ( args.length == 1 ) return args[0].toString();
              StringBuilder sb = new StringBuilder();
              for ( Object o: args) {
                sb.append(o).append(":");
              }
              return sb.deleteCharAt(sb.length() - 1).toString();
            }
          `
        }));
      }
    }
  ]
});
