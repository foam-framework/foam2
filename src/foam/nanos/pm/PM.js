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
    // PMLogger logger = (PMLogger) x.get("pmLogger");
    // if ( logger != null ) {
    //   logger.log(this);
    // }
    if ( ! this.getClassType().getId().equals("foam.dao.PMDAO") ) {
      if ( this.getClassType().getId().indexOf("PM") != -1 ) return;
      if ( this.getName().indexOf("PM")              != -1 ) return;
      if ( this.getClassType().getId().indexOf("pm") != -1 ) return;
      if ( this.getName().indexOf("pm")              != -1 ) return;
    }
    
    foam.dao.DAO dao = (foam.dao.DAO) x.get("pmDAO");
    if ( dao != null ) {
      dao.put(this);
    } else {
      foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
      if ( logger != null ) {
        logger.warning("PM.log:", "pmDAO not found in context");
      } else {
        System.out.println("PM.log: pmDAO and logger not found in context.");
      }
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
  public PM(Class cls, String name) {
    setName(name);
    foam.core.ClassInfoImpl classInfo = new foam.core.ClassInfoImpl();
    classInfo.setObjClass(cls);
    classInfo.setId(cls.getName());
    setClassType(classInfo);
  }
`
        }));
      }
    }
  ]
});
