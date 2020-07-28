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
    'foam.nanos.analytics.Foldable'
  ],

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.X'
  ],

  ids: [ 'id', 'name', 'startTime' ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'startTime',
      class: 'DateTime',
      factory: function() {
        return new Date();
      },
      javaFactory: `return new java.util.Date();`
    },
    {
      name: 'endTime',
      class: 'DateTime'
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
    setEndTime(new java.util.Date());
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
    return getEndTime().getTime() - getStartTime().getTime();
      `
    },
    {
      name: 'doFolds',
      javaCode: `
    fm.foldForState(getId()+":"+getName(), getStartTime(), getTime());
      `
    },
    {
      name: 'error',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'args', type: 'Object...' }
      ],
      javaCode: `
        String str = "";
        setIsError(true);
        for (Object obj: args) {
          if ( obj instanceof java.lang.Exception ) {
            setException(obj);
            str += ((Exception) obj).getMessage() + ",";
          }
        }
        if ( str.length() > 0 )
          setErrorMessage(str.substring(0, str.length() - 1));
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

              pm.setId(fo.getClassInfo().getId());
              pm.setName(combine(name));
              pm.init_();

              return pm;
            }

            public static PM create(X x, ClassInfo clsInfo, String... name) {
              PM pm = (PM) x.get("PM");

              if ( pm == null ) return new PM(clsInfo, name);

              pm.setId(clsInfo.getId());
              pm.setName(combine(name));
              pm.init_();

              return pm;
            }

            public PM(ClassInfo clsInfo, String... name) {
              setName(combine(name));
              setId(clsInfo.getId());
              init_();
            }

            public PM(Class cls, String... name) {
              setName(combine(name));
              foam.core.ClassInfoImpl clsInfo = new foam.core.ClassInfoImpl();
              clsInfo.setObjClass(cls);
              clsInfo.setId(cls.getName());
              setId(clsInfo.getId());
              init_();
            }

            public PM(FObject fo, String... name) {
              this(fo.getClassInfo(), name);
            }

            public PM(Object... args) {
              setId(args[0].toString());
              String str = "";
              for (Object obj: java.util.Arrays.copyOfRange(args, 1, args.length)){
                str += obj.toString() + ":";
              }
              if ( str.length() > 0 )
                setName(str.substring(0, str.length() - 1));
              init_();
            }

            private static String combine(String... args) {
              String str = "";
              for ( String s: args) {
                str += s + ":";
              }
              return str.substring(0, str.length() - 1);
            }
          `
        }));
      }
    }
  ]
});
