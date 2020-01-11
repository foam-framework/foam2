/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'PipelinePMDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.nanos.boot.NSpecAware'
  ],

  requires: [
    'foam.nanos.pm.PM'
  ],

  javaImports: [
    'foam.core.X',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.boot.NSpec',
    'foam.nanos.pm.PM'
  ],

  constants: [
    {
      name: 'PIPE_PM_START',
      documentation: '',
      type: 'String',
      value: '__pipePMStart__'
    }
  ],

  properties: [
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      type: 'foam.nanos.boot.NSpec'
    },
    {
      documentation: 'Enable PMs on DAO.find operations',
      name: 'pmFind',
      class: 'Boolean'
    },
    {
      name: 'classType',
      class: 'Class',
      javaFactory: `
        return PipelinePMDAO.getOwnClassInfo();
      `,
      hidden: true
    },
    {
      name: 'putName',
      class: 'String',
      javaFactory: 'return createName_("put");',
      visibility: 'RO'
    },
    {
      name: 'findName',
      class: 'String',
      javaFactory: 'return createName_("find");',
      visibility: 'RO'
    },
    {
      name: 'selectName',
      class: 'String',
      javaFactory: 'return createName_("select");',
      visibility: 'RO'
    },
    {
      name: 'removeName',
      class: 'String',
      javaFactory: 'return createName_("remove");',
      visibility: 'RO'
    },
    {
      name: 'removeAllName',
      class: 'String',
      javaFactory: 'return createName_("removeAll");',
      visibility: 'RO'
    },
    {
      name: 'cmdName',
      class: 'String',
      javaFactory: 'return createName_("cmd");',
      visibility: 'RO'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
    `public PipelinePMDAO(X x, NSpec nspec, DAO delegate) {
      setX(x);
      setNSpec(nspec);
      setDelegate(delegate);
      init_();
     }

     // TODO: Remove when all DAO nspecs converted to EasyDAO
     public PipelinePMDAO(X x, DAO delegate) {
      setX(x);
      setDelegate(delegate);
      init_();
     }
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'init_',
      javaCode: `
        ProxyDAO delegate = (ProxyDAO) getDelegate();
        if ( delegate.getDelegate() instanceof ProxyDAO && ! ( delegate.getDelegate() instanceof PipelinePMDAO ) ) {
          delegate.setDelegate(new PipelinePMDAO(getX(), getNSpec(), delegate.getDelegate()));
        }
        delegate.setDelegate(new EndPipelinePMDAO(getX(), delegate.getDelegate()));
    `
    },
    {
      name: 'createName_',
      args: [ {name: 'name', type: 'String '} ],
      javaType: 'String',
      javaCode: `
        String spec = ( getNSpec() == null ) ? "NOSPEC" : getNSpec().getName();
        return spec + "/" + getDelegate().getClass().getSimpleName() + ":" + name;
      `
    },
    {
      documentation: `
Creates the PM that will measure the performance of each operation and creates a new context with it as a variable which the EndPipelinePMDAO
   *  will use to access the pm after it is passed onto it through the arguments of the DAO operations
`,
      name: 'createPMX',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'op',
          type: 'String'
        }
      ],
      javaType: 'X',
      javaCode: `
      PM pm = PM.create(x, getClassType(), op);
      return x.put(PIPE_PM_START, pm);
      `
    },
    {
      documentation: `
Creates the PM pipeline by adding an EndPipelinePMDAO after of this class only if it is a ProxyDAO.
If the delegate of that is also a ProxyDAO, creates a new PipelinePMDAO in the chain beofre it which repeats this procedure recursively.
`,
      name: 'createPipeline',
      javaCode: `
      `
    },
    /*
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
    */
    {
      name: 'put_',
      javaCode: `
    return getDelegate().put_(createPMX(x, getPutName()), obj);
     `
    },
    {
      name: 'find_',
      javaCode: `
    X y = getPmFind() ? createPMX(x, getFindName()) : x;
    return super.find_(y, id);
     `
    },
    {
      name: 'select_',
      javaCode: `
      return getDelegate().select_(createPMX(x, getSelectName()), sink, skip, limit, order, predicate);
     `
    },
    {
      name: 'remove_',
      javaCode: `
    return getDelegate().remove_(createPMX(x, getRemoveName()), obj);
     `
    },
    {
      name: 'removeAll_',
      javaCode: `
    getDelegate().removeAll_(createPMX(x, getRemoveAllName()), skip, limit, order, predicate);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
    return getDelegate().cmd_(createPMX(x, getCmdName()), obj);
     `
    }
  ],

  classes: [
    {
//      package: 'foam.dao',
      name: 'EndPipelinePMDAO',
      extends: 'foam.dao.ProxyDAO',

      requires: [
        'foam.nanos.pm.PM'
      ],

      javaImports: [
        'foam.core.X',
        'foam.mlang.order.Comparator',
        'foam.mlang.predicate.Predicate',
        'foam.nanos.pm.PM'
      ],

      axioms: [
        {
          name: 'javaExtras',
          buildJavaClass: function(cls) {
            cls.extras.push(foam.java.Code.create({
              data:`
     public EndPipelinePMDAO(X x, DAO delegate) {
       super(x, delegate);
     }
          `
            }));
          }
        }
      ],

      methods: [
        {
          name: 'log',
          args: [
            {
              name: 'x',
              type: 'X',
            }
          ],
          javaCode: `
      PM pm = (PM) x.get(PIPE_PM_START);
      if ( pm != null ) pm.log(x);
      `
        },
        {
          name: 'put_',
          javaCode: `
      log(x);
      return super.put_(x, obj);
     `
        },
        {
          name: 'find_',
          javaCode: `
      log(x);
      return super.find_(x, id);
     `
        },
        {
          name: 'select_',
          javaCode: `
      log(x);
      return super.select_(x, sink, skip, limit, order, predicate);
     `
        },
        {
          name: 'remove_',
          javaCode: `
      log(x);
      return super.remove_(x, obj);
     `
        },
        {
          name: 'removeAll_',
          javaCode: `
      log(x);
      super.removeAll_(x, skip, limit, order, predicate);
     `
        },
        {
          name: 'cmd_',
          javaCode: `
      log(x);
      return super.cmd_(x, obj);
     `
        }
      ]
    }
  ]
});
