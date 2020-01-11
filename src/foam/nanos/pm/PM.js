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

  ids: [ 'classType', 'name', 'startTime' ],

  properties: [
    {
      class: 'Class',
      name: 'classType'
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
    PMLogger pmLogger = (PMLogger) x.get(DAOPMLogger.SERVICE_NAME);
    if ( pmLogger != null ) {
      setEndTime(new java.util.Date());
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
    fm.foldForState(getClassType().getId()+":"+getName(), getStartTime(), getTime());
      `
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
          public static PM create(X x, FObject fo, String name) {
            PM pm = (PM) x.get("PM");

            if ( pm == null ) return new PM(fo, name);

            pm.setClassType(fo.getClassInfo());
            pm.setName(name);
            pm.init_();

            return pm;
          }

          public static PM create(X x, ClassInfo clsInfo, String name) {
            PM pm = (PM) x.get("PM");

            if ( pm == null ) return new PM(clsInfo, name);

            pm.setClassType(clsInfo);
            pm.setName(name);
            pm.init_();

            return pm;
          }

/*
  public static PM create(X x, Class cls, String name) {
    PM pm = (PM) x.get("PM");

    if ( pm == null ) return new PM(cls, name);

    pm.setClassType(cls);
    pm.setName(name);
    pm.init_();

    return pm;
  }
  */

  public PM(ClassInfo clsInfo, String name) {
    setName(name);
    setClassType(clsInfo);
    init_();
  }

  public PM(Class cls, String name) {
    setName(name);
    foam.core.ClassInfoImpl clsInfo = new foam.core.ClassInfoImpl();
    clsInfo.setObjClass(cls);
    clsInfo.setId(cls.getName());
    setClassType(clsInfo);
    init_();
  }

  public PM(FObject fo, String name) {
    this(fo.getClassInfo(), name);
  }

`
        }));
      }
    }
  ]
});
