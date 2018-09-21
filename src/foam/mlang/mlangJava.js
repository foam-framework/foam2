/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.mlang.predicate.Or',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
    },
    {
      name: 'partialEval',
      javaReturns: 'foam.mlang.predicate.Predicate',
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.And',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
    },
    {
      name: 'partialEval',
      javaReturns: 'foam.mlang.predicate.Predicate',
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.In',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
    {
      name: 'createStatement',
      javaReturns: 'String',

    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Map',
  flags: ['java'],

  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        }
      ],
      javaReturns: 'Object',
    },
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Contains',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
    {
      name: 'createStatement',
      javaReturns: 'String',

    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'foam.dao.pg.IndexedPreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.ContainsIC',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.StartsWith',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.StartsWithIC',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.EndsWith',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.Constant',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
  ]
});

foam.CLASS({
  refines: 'foam.mlang.ArrayConstant',
  flags: ['java'],

  methods: [
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Eq',
  flags: ['java'],

  methods: [
    {
      name: 'f',
      // TODO(adamvy): Is there a better option than all the Comparable casts?
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Neq',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lt',
  flags: ['java'],

  methods: [
    {
      name: 'f',

    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lte',
  flags: ['java'],

  methods: [
    {
      name: 'f',

    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gt',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gte',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Not',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
    {
      name: 'partialEval',
      javaReturns: 'foam.mlang.predicate.Predicate',
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.IsInstanceOf',
  flags: ['java'],

   methods: [
    {
      name: 'f',
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Has',
  flags: ['java'],

  methods: [
    {
      name: 'f',
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.order.Desc',
  flags: ['java'],

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1',
      javaType: 'foam.mlang.order.Comparator',
    }
  ],

  methods: [
    {
      name: 'compare',
      javaReturns: 'int',
      args: [
        {
          name: 'o1',
          javaType: 'Object'
        },
        {
          name: 'o2',
          javaType: 'Object'
        }
      ],
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.order.CustomComparator',
  flags: ['java'],

  methods: [
    {
      name: 'orderTail',
    },
    {
      name: 'orderPrimaryProperty',
    },
    {
      name: 'orderDirection',
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Count',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Max',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Min',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],

      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Sum',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],

    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Unary',
  flags: ['java'],

  methods: [
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Binary',
  flags: ['java'],

  methods: [
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Nary',
  flags: ['java'],

  methods: [
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Keyword',
  flags: ['java'],


  methods: [
    {
      name: 'f',
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'foam.dao.pg.IndexedPreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.GroupBy',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
    },
    {
      name: 'clone',
  ]
});
