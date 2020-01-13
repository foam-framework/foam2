/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'PMDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.boot.NSpecAware'
  ],

  requires: [
    'foam.nanos.pm.PM'
  ],

  javaImports: [
    'foam.core.X',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      type: 'foam.nanos.boot.NSpec'
    },
    {
      name: 'classType',
      class: 'Class',
      javaFactory: `
        return PMDAO.getOwnClassInfo();
      `,
      hidden: true
    },
    {
      name: 'putName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":put";',
      visibility: 'RO'
    },
    {
      name: 'findName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":find";',
      visibility: 'RO'
    },
    {
      name: 'selectName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":select";',
      visibility: 'RO'
    },
    {
      name: 'removeName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":remove";',
      visibility: 'RO'
    },
    {
      name: 'removeAllName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":removeAll";',
      visibility: 'RO'
    },
    {
      name: 'cmdName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":cmd";',
      visibility: 'RO'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            public PMDAO(X x, DAO delegate) {
              super(x, delegate);
            }
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'createPM',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'op',
          type: 'String'
        }
      ],
      javaType: 'PM',
      javaCode: `
    return getEnabled() ? PM.create(x, this.getClassType(), op) : null;
      `
    },
    {
      name: 'log',
      args: [
        {
          name: 'x',
          type: 'X',
        },
        {
          name: 'pm',
          type: 'PM'
        }
      ],
      javaCode: `
    if ( pm != null ) {
      pm.log(x);
    }
      `
    },
    {
      name: 'put_',
      javaCode: `
    PM pm = createPM(x, getPutName());
    try {
      return super.put_(x, obj);
    } finally {
      log(x, pm);
    }
     `
    },
    {
      name: 'find_',
      javaCode: `
    PM pm = createPM(x, getFindName());
    try {
      return super.find_(x, id);
    } finally {
      log(x, pm);
    }
     `
    },
    {
      name: 'select_',
      javaCode: `
    PM pm = createPM(x, getSelectName());
    try {
      return super.select_(x, sink, skip, limit, order, predicate);
    } finally {
      log(x, pm);
    }
     `
    },
    {
      name: 'removeAll_',
      javaCode: `
    PM pm = createPM(x, getRemoveAllName());
    try {
      super.removeAll_(x, skip, limit, order, predicate);
    } finally {
      log(x, pm);
    }
     `
    },
    {
      name: 'cmd_',
      javaCode: `
    PM pm = createPM(x, getCmdName());
    try {
      return super.cmd_(x, obj);
    } finally {
      log(x, pm);
    }
     `
    }
  ]
});
