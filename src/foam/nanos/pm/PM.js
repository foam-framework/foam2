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
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.pm.PMInfo'
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
      setEndTime(new java.util.Date());
      if ( x == null ) return;
      PMLogger pmLogger = (PMLogger) x.get(DAOPMLogger.SERVICE_NAME);
      DAO pmInfoDAO = (DAO) x.get("pmInfoDAO");
      if ( pmInfoDAO != null ) {
        java.util.List pmInfoList = ( (ArraySink) (pmInfoDAO.where(foam.mlang.MLang.EQ(PMInfo.NAME, this.getName())).select(new ArraySink())) ).getArray();
        PMInfo pminfo = null;
        if ( pmInfoList.size() > 0 && (pminfo = (PMInfo) pmInfoList.get(0)) != null )
          pminfo = (PMInfo) pminfo.fclone();
        if ( pminfo != null && pminfo.getCapture() ) {
          StringBuffer trace = new StringBuffer();
          for ( StackTraceElement j : Thread.currentThread().getStackTrace() ) {
            trace.append(j.toString());
            trace.append(System.getProperty("line.separator"));
          }
          pminfo.setCapture(false);
          pminfo.setCaptureTrace(trace.toString());
          pmInfoDAO.put(pminfo);
        }
      }
      if ( pmLogger != null )
        pmLogger.log(this);
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
  public PM(Class cls, String name) {
    setName(name);
    foam.core.ClassInfoImpl classInfo = new foam.core.ClassInfoImpl();
    classInfo.setObjClass(cls);
    classInfo.setId(cls.getName());
    setClassType(classInfo);
    init_();
  }
`
        }));
      }
    }
  ]
});