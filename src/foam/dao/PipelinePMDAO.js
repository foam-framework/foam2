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
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.pm.PM'
  ],

  constants: [
    {
      name: 'PIPE_PM_START',
      documentation: '',
      type: 'String',
      value: 'pipePmStart'
    }
  ],

  properties: [
    {
      documentation: `true when createPipeline has been called.
both enabled.postSet and Builder.init_() can call createPipeline.`,
      name: 'initialized',
      class: 'Boolean',
      value: false
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true,
      javaPostSet: `
      if ( enabled_ != val ) {
        boolean toggled = false;
        DAO d = getDelegate();
        while ( d != null ) {
          if ( d instanceof PipelinePMDAO ) {
            ((EnabledAware) d).setEnabled(val);
            toggled = true;
            break;
          }
          if ( d instanceof ProxyDAO ) {
            d = ((ProxyDAO) d).getDelegate();
          } else {
            break;
          }
        }
        if ( val &&
             ! toggled ) {
          // createPipeline has yet to be called.
          createPipeline();
        }
      }
      `
    },
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
    `public PipelinePMDAO(X x, DAO delegate) {
       super(x, delegate);
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
    if ( getEnabled() ) {
      createPipeline();
    }
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
    if ( getEnabled() ) {
      PM pm = new PM();
      pm.setClassType(this.getOwnClassInfo());
      pm.setName(op);
      pm.init_();
      return x.put(PIPE_PM_START, pm);
    }
    return x;
      `
    },
    {
      documentation: `
Creates the PM pipeline by adding an EndPipelinePMDAO after of this class only if it is a ProxyDAO.
If the delegate of that is also a ProxyDAO, creates a new PipelinedPMDAO in the chain beofre it which repeats this procedure recursively.
`,
      name: 'createPipeline',
      javaCode: `
    synchronized (this) {
      if ( getInitialized() ) {
        return;
      } else {
        setInitialized(true);
      }
    }
((foam.nanos.logger.Logger) getX().get("logger")).debug("PipelinePMDAO createPipeline INITIALIZED");
    DAO delegate = getDelegate();
    DAO secondaryDelegate;
    secondaryDelegate = ((ProxyDAO) delegate).getDelegate();
    ((ProxyDAO) delegate).setDelegate(new EndPipelinePMDAO(getX(), secondaryDelegate));
    delegate = ((ProxyDAO) delegate).getDelegate();
    if ( ( secondaryDelegate instanceof ProxyDAO ) && ! ( secondaryDelegate instanceof PipelinePMDAO ) ) {
      PipelinePMDAO pmd = new PipelinePMDAO(getX(), secondaryDelegate);
      pmd.setNSpec(getNSpec());
      ((ProxyDAO) delegate).setDelegate(pmd);
    }
      `
    },
    {
      name: 'isPipelinePMDAO',
      args: [
        {
          name: 'dao',
          type: 'DAO'
        }
      ],
      javaType: 'Boolean',
      javaCode: `
    return dao instanceof PipelinePMDAO || dao instanceof EndPipelinePMDAO;
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
    return super.put_(createPMX(x, getPutName()), obj);
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
      return super.select_(createPMX(x, getSelectName()), sink, skip, limit, order, predicate);
     `
    },
    {
      name: 'remove_',
      javaCode: `
    return super.remove_(createPMX(x, getRemoveName()), obj);
     `
    },
    {
      name: 'removeAll_',
      javaCode: `
    super.removeAll_(createPMX(x, getRemoveAllName()), skip, limit, order, predicate);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
    return super.cmd_(createPMX(x, getCmdName()), obj);
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
      if ( pm != null ) {
        pm.log(x);
      }
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
