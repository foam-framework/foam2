/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  refines: 'foam.mlang.F',

  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaReturns: 'Object'
    }
  ]
});

foam.INTERFACE({
  refines: 'foam.mlang.Expr',

  methods: [
    {
      name: 'partialEval',
      javaReturns: 'foam.mlang.Expr'
    },
    {
      name: 'createStatement',
      javaReturns: 'String'
    },
    {
      name: 'prepareStatement',
      javaReturns: 'void',
      args: [
        {
          name: 'stmt',
          javaType: 'java.sql.PreparedStatement'
        }
      ]
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.ExprProperty',

  properties: [
    ['javaType', 'foam.mlang.Expr'],
    ['javaJSONParser', 'foam.lib.json.ExprParser']
  ]
});


foam.CLASS({
  refines: 'foam.mlang.SinkProperty',

  properties: [
    ['javaType', 'foam.dao.Sink'],
    ['javaJSONParser', 'foam.lib.json.FObjectParser']
  ]
});


foam.INTERFACE({
  refines: 'foam.mlang.predicate.Predicate',

  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaReturns: 'boolean'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType: 'String'
      }]
    },
    {
      name: 'prepareStatement',
      args: [
        {
          name: 'stmt',
          javaType: 'java.sql.PreparedStatement'
        }
      ]
    },
    {
      name: 'partialEval',
      javaReturns: 'foam.mlang.predicate.Predicate'
    },
    {
      name: 'toIndex',
      javaSupport: false,
      args: [
        {
          name: 'tail',
          javaType: 'foam.dao.index.Index'
        }
      ],
      javaReturns: 'foam.dao.index.Index'
    },
    {
      name: 'toDisjunctiveNormalForm',
      javaSupport: false,
      javaReturns: 'foam.mlang.predicate.Predicate'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.PredicateProperty',

  properties: [
    ['javaType', 'foam.mlang.predicate.Predicate']
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.PredicateArray',

  properties: [
    ['javaType', 'foam.mlang.predicate.Predicate[]']
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.AbstractPredicate',

  methods: [
    {
      // TODO: This is a duplicate of the method in Predicate,
      // but it's necessary because when we refine Predicate, it doesn't
      // update classes that copied their axioms in from Predicate as a trait.
      // If we were more careful about the ordering of classes this wouldn't be
      // necessary.
      name: 'f',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: 'return false;',
      javaReturns: 'boolean'
    },
    {
      // TODO: Same TODO as .f method above
      name: 'toIndex',
      javaSupport: false
    },
    {
      // TODO: Same TODO as .f
      name: 'toDisjunctiveNormalForm',
      javaSupport: false,
      javaReturns: 'foam.mlang.predicate.Predicate'
    },
    {
      name: 'partialEval',
      javaCode: 'return this;',
      javaReturns: 'foam.mlang.predicate.Predicate'
    },
    {
      name: 'toString',
      javaCode: 'return classInfo_.getId();'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.AbstractExpr',

  methods: [
    {
      name: 'partialEval',
      javaCode: 'return this;',
      // Remove this javaReturns when it is inherited properly. (Traits are fixed).
      javaReturns: 'foam.mlang.Expr'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.True',

  methods: [
    {
      name: 'f',
      javaCode: 'return true;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.False',

  methods: [
    {
      name: 'f',
      javaCode: 'return false;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Or',

  methods: [
    {
      name: 'f',
      javaCode: 'for ( int i = 0 ; i < getArgs().length ; i++ ) {\n'
                + '  if ( getArgs()[i].f(obj) ) return true;\n'
                + '}\n'
                + 'return false;\n'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.And',

  methods: [
    {
      name: 'f',
      javaCode: 'for ( int i = 0 ; i < getArgs().length ; i++ ) {\n'
                + '  if ( ! getArgs()[i].f(obj) ) return false;\n'
                + '}\n'
                + 'return true;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.In',

  methods: [
    {
      name: 'f',
      javaCode:
  `
  Object lhs = getArg1().f(obj);
  // boolean uppercase = lhs.getClass().isEnum(); TODO: Account for ENUMs? (See js)
  Object rhs = getArg2().f(obj);

  if ( rhs instanceof Object[] ) {
    // Checks if rhs array contains the lhs object
    Object[] values = (Object[])rhs;

    for ( int i = 0 ; i < values.length ; i++ ) {
      if ( ( ( (Comparable) lhs ).compareTo( (Comparable) values[i] ) ) == 0 ) {
        return true;
      }
    }
  } else if ( rhs instanceof String ) {
    // Checks if lhs is substring of rhs
    return ( lhs instanceof String ) &&
      ( ( (String) rhs ).contains( (String) lhs ) );
  }

  return false;
  `
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Map',

  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `return (foam.core.FObject) getArg1().f(obj);`
    },
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
      javaCode: 'getDelegate().put(f(obj), sub);'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Contains',

  methods: [
    {
      name: 'f',
      javaCode: `String s1 = (String) getArg1().f(obj);
String s2 = (String) getArg2().f(obj);
return ( s1 != null && s2 != null && s1.contains(s2) );`
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        // table as method argument because it can't be parametrized into a prepared statement
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.ContainsIC',

  methods: [
    {
      name: 'f',
      javaCode: `String s1 = (String) getArg1().f(obj);
String s2 = (String) getArg2().f(obj);
return ( s1 != null && s2 != null && s1.toUpperCase().contains(s2.toUpperCase()) );`
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.StartsWith',

  methods: [
    {
      name: 'f',
      javaCode: `
Object arg1 = getArg1().f(obj);
String arg2 = (String) getArg2().f(obj);

if ( arg1 instanceof Object[] ) {
  Object[] values = (Object[]) arg1;
  for ( int i = 0 ; i < values.length ; i++ ) {
    if ( values[i] instanceof String && ((String) values[i]).startsWith(arg2) )
      return true;
  }
} else if ( arg1 instanceof String ) {
  return ((String) arg1).startsWith(arg2);
}
return false;`
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: `return getArg1().createStatement() + " like '" + getArg2().createStatement() + "%'";`
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.StartsWithIC',

  methods: [
    {
      name: 'f',
      javaCode: `
Object arg1 = getArg1().f(obj);
String arg2 = ((String) getArg2().f(obj)).toUpperCase();

if ( arg1 instanceof Object[] ) {
  Object[] values = (Object[]) arg1;
  for ( int i = 0 ; i < values.length ; i++ ) {
    if ( values[i] instanceof String && ((String) values[i]).toUpperCase().startsWith(arg2) )
      return true;
  }
} else if ( arg1 instanceof String ) {
  return ((String) arg1).toUpperCase().startsWith(arg2);
}
return false;`
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: `return "UPPER(" + getArg1().createStatement() + ") like 'UPPER(" + getArg2().createStatement() + ")%'";`
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.Constant',

  methods: [
    {
      name: 'f',
      javaCode: 'return getValue();'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return " ? "; '
    },
    {
      name: 'prepareStatement',
      javaReturns: 'void',
      javaCode: ''
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Eq',

  methods: [
    {
      name: 'f',
      // TODO(adamvy): Is there a better option than all the Comparable casts?
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) == 0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType: 'String'
      }],
      // TODO: select columns
      javaCode: 'return getArg1().createStatement() + " = " + getArg2().createStatement();'
    },
    {
      name: 'prepareStatement',
      javaReturns: 'void',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: '// try {\n'
                + '  // stmt.setObject(1, getArg2().prepareStatement());\n'
                + '// } catch (java.sql.SQLException e) {\n'
                + '  // e.printStackTrace();\n'
                + '// }'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Neq',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) != 0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lt',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) < 0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lte',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) <= 0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gt',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) > 0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gte',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) >= 0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return " ";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Not',

  methods: [
    {
      name: 'f',
      javaCode: 'return ! getArg1().f(obj);'
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
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Has',

  methods: [
    {
      name: 'f',
      // TODO(kgr): Instead of checking type, use polymorphims and add a
      // type-specific has() method to the Property.
      javaCode: `Object value = getArg1().f(obj);
        return ! (value == null ||
          (value instanceof String && ((String)value).length() == 0) ||
          (value.getClass().isArray() && java.lang.reflect.Array.getLength(value) == 0));`
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',

  methods: [
    {
      name: 'orderTail',
      javaCode: 'return null;'
    },
    {
      name: 'orderPrimaryProperty',
      javaCode: 'return this;'
    },
    {
      name: 'orderDirection',
      javaCode: 'return 1;'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.order.Desc',

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
      javaCode: 'return -1 * getArg1().compare(o1, o2);'
    },
    {
      name: 'toString',
      javaCode: 'return "DESC(" + getArg1().toString() + ")";'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.order.CustomComparator',

  methods: [
    {
      name: 'orderTail',
      javaCode: 'return null;'
    },
    {
      name: 'orderPrimaryProperty',
      javaCode: 'return null;'
    },
    {
      name: 'orderDirection',
      javaCode: 'return 1;'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Count',

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
      javaCode: 'setValue(this.getValue() + 1);'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Max',

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
      javaCode: 'setValue(Math.max(((Number) getArg1().f(obj)).doubleValue(), getValue()));'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Min',

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
      javaCode: function() {
/*if (obj.compareTo(this.getValue()) > 0) {
  this.setValue(obj);
}*/
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.Sum',

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
      javaCode: 'setValue(getValue() + (double) this.arg1_.f(obj));'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Binary',

  methods: [
    {
      name: 'f',
      javaCode: 'return false;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Keyword',

  javaImports: [
    'foam.core.PropertyInfo',
    'java.util.Iterator',
    'java.util.List'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
if ( ! ( getArg1().f(obj) instanceof String) )
  return false;

String arg1 = ((String) getArg1().f(obj)).toUpperCase();
List props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
Iterator i = props.iterator();
while ( i.hasNext() ) {
  PropertyInfo prop = (PropertyInfo) i.next();
  if ( ! ( prop.f(obj) instanceof String ) )
    continue;
  String s = ((String) prop.f(obj)).toUpperCase();
  if ( s.contains(arg1) )
    return true;
}

return false;`
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      args: [{
        name: 'table',
        javaType : 'String'
      }],
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      args: [{
        name: 'stmt',
        javaType: 'java.sql.PreparedStatement'
      }],
      javaCode: " return; "
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.sink.GroupBy',

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ],
      javaCode:
`Object arg1 = getArg1().f(obj);
if ( getProcessArrayValuesIndividually() && arg1 instanceof Object[] ) {
  Object[] keys = (Object[]) arg1;
  for ( Object key : keys ) {
    putInGroup_(sub, key, obj);
  }
} else {
  putInGroup_(sub, arg1, obj);
}`
    },
    {
      name: 'putInGroup_',
      javaReturns: 'void',
      args: [
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        },
        {
          name: 'key',
          javaType: 'Object'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode:
`foam.dao.Sink group = (foam.dao.Sink) getGroups().get(key);
 if ( group == null ) {
   group = (foam.dao.Sink) ((foam.core.FObject) getArg2()).fclone();
   getGroups().put(key, group);
   getGroupKeys().add(key);
 }
 group.put(obj, sub);`
    },
    {
      name: 'sortedKeys',
      javaReturns: 'java.util.List',
      args: [
        {
          name: 'comparator',
          javaType: 'foam.mlang.order.Comparator'
        }
      ],
      javaCode:
`if ( comparator != null ) {
  java.util.Collections.sort(getGroupKeys(), comparator);
} else {
  java.util.Collections.sort(getGroupKeys());
}
return getGroupKeys();`
    },
    {
      name: 'clone',
      javaReturns: 'foam.mlang.sink.GroupBy',
      javaCode:
`GroupBy clone = new GroupBy();
clone.setArg1(this.getArg1());
clone.setArg2(this.getArg2());
return clone;`
    },
    {
      name: 'toString',
      javaReturns: 'String',
      javaCode: 'return this.getGroups().toString();'
    }
  ]
});
