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

  ids: [ 'classType', 'name' ],

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
    if ( x == null ) return;
    setEndTime(new java.util.Date());
    foam.dao.DAO dao = (foam.dao.DAO) x.get("pmDAO");
    if ( dao != null ) {
      dao.put(this);
    }
//    PMLogger logger = (PMLogger) x.get(DAOPMLogger.SERVICE_NAME);
//    if ( logger != null ) logger.log(this);
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
    fm.foldForState(getId(), getStartTime(), getTime());
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
