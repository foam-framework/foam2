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

  implements: [ 'foam.dao.SQLStatement' ],

  methods: [
    {
      name: 'partialEval',
      javaReturns: 'foam.mlang.Expr'
    },
  ]
});


foam.CLASS({
  refines: 'foam.mlang.ExprProperty',

  properties: [
    ['javaType', 'foam.mlang.Expr'],
    ['javaJSONParser', 'new foam.lib.json.ExprParser()']
  ]
});


foam.CLASS({
  refines: 'foam.mlang.SinkProperty',

  properties: [
    ['javaType', 'foam.dao.Sink'],
    ['javaJSONParser', 'new foam.lib.json.FObjectParser()']
  ]
});


foam.INTERFACE({
  refines: 'foam.mlang.predicate.Predicate',

  implements: [ 'foam.dao.SQLStatement' ],

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
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      javaReturns: 'void',
      javaThrows: [ 'java.sql.SQLException' ],
      args: [
        {
          name: 'stmt',
          javaType: 'foam.dao.pg.IndexedPreparedStatement'
        }
      ],
      javaCode: ' '
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
      javaCode: 'return " 1 = 1 ";'
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
      javaCode: 'return " 1 <> 1 ";'
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
      javaCode:
`StringBuilder stmt = new StringBuilder();
Predicate[] predicates = getArgs();
int length = predicates.length;

for ( int i = 0 ; i < length ; i++ ) {
  Predicate predicate = predicates[i];
  stmt.append(" (").append(predicate.createStatement()).append(") ");
  if ( i != length - 1 ) {
    stmt.append(" OR ");
  }
}
return stmt.toString();`
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
      javaCode:
`StringBuilder stmt = new StringBuilder();
Predicate[] predicates = getArgs();
int length = predicates.length;

for ( int i = 0 ; i < length ; i++ ) {
  Predicate predicate = predicates[i];
  stmt.append(" (").append(predicate.createStatement()).append(") ");
  if ( i != length - 1 ) {
    stmt.append(" AND ");
  }
}
return stmt.toString();`
    },
    {
      name: 'partialEval',
      javaReturns: 'foam.mlang.predicate.Predicate',
      javaCode: 'java.util.List<Predicate> args = new java.util.ArrayList<>();\n' +
      '    boolean update = false;\n' +
      '    True TRUE = new True();\n' +
      '    False FALSE = new False();\n' +
      '    for ( int i = 0; i < this.args_.length; i++ ) {\n' +
      '      Predicate arg = this.args_[i];\n' +
      '      Predicate newArg = this.args_[i].partialEval();\n' +
      '      if ( newArg instanceof False ) return FALSE;\n' +
      '      if ( arg instanceof And ) {\n' +
      '        for ( int j = 0; j < ( ( (And) arg ).args_.length ); j++ ) {\n' +
      '          args.add(( (And) arg ).args_[j]);\n' +
      '        }\n' +
      '        update = true;\n' +
      '      } else {\n' +
      '        if ( arg instanceof True || arg == null ) {\n' +
      '          update = true;\n' +
      '        } else {\n' +
      '          args.add(arg);\n' +
      '          if ( ! arg.createStatement().equals(newArg.createStatement()) ) update = true;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '    if ( args.size() == 0 ) return TRUE;\n' +
      '    if ( args.size() == 1 ) return args.get(0);\n' +
      '    if ( update ) {\n' +
      '      And newPredicate = new And();\n' +
      '      Predicate newArgs[] = new Predicate[args.size()];\n' +
      '      int i = 0;\n' +
      '      for ( Predicate predicate : args )\n' +
      '        newArgs[i++] = predicate;\n' +
      '      newPredicate.setArgs(newArgs);\n' +
      '      return newPredicate;\n' +
      '    }\n' +
      '    return this;'
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
      javaCode: 'return " " + getArg1().createStatement() + " in " + getArg2().createStatement();'
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
      javaCode:
`Object s1 = getArg1().f(obj);
String s2 = (String) getArg2().f(obj);
if ( s1 instanceof String[] ) {
  for ( String s : (String[]) s1 ) {
    if ( s.contains(s2) )
      return true;
  }
}
return ( s1 instanceof String && ((String) s1).contains(s2) );`
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: `return " '" + getArg1().createStatement() + "' like '%" + getArg2().createStatement() + "%' ";`
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

  methods: [
    {
      name: 'f',
      javaCode:
`Object s1 = getArg1().f(obj);
String s2 = ((String) getArg2().f(obj)).toUpperCase();
if ( s1 instanceof String[] ) {
  for ( String s : (String[]) s1 ) {
    if ( s.toUpperCase().contains(s2) )
      return true;
  }
}
return ( s1 instanceof String && ((String) s1).toUpperCase().contains(s2) );`
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: `return " '" + getArg1().createStatement() + "' ilike '%" + getArg2().createStatement() + "%' ";`
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.StartsWith',

  methods: [
    {
      name: 'f',
      javaCode:
`Object arg1 = getArg1().f(obj);
String arg2 = (String) getArg2().f(obj);
if ( arg1 instanceof String[] ) {
  for ( String s : (String[]) arg1 ) {
    if ( s.startsWith(arg2) )
      return true;
  }
}
return ( arg1 instanceof String && ((String) arg1).startsWith(arg2) );`
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: `return " '" + getArg1().createStatement() + "' like '" + getArg2().createStatement() + "%' ";`
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.StartsWithIC',

  methods: [
    {
      name: 'f',
      javaCode:
`Object arg1 = getArg1().f(obj);
String arg2 = ((String) getArg2().f(obj)).toUpperCase();
if ( arg1 instanceof String[] ) {
  for ( String s : (String[]) arg1 ) {
    if ( s.toUpperCase().startsWith(arg2) )
      return true;
  }
}
return ( arg1 instanceof String && ((String) arg1).toUpperCase().startsWith(arg2) );`
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: `return " '" + getArg1().createStatement() + "' ilike '" + getArg2().createStatement() + "%' ";`
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
      javaCode: 'stmt.setObject(getValue());'
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.ArrayConstant',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
`protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
  @Override
  protected StringBuilder initialValue() {
    return new StringBuilder();
  }

  @Override
  public StringBuilder get() {
    StringBuilder b = super.get();
    b.setLength(0);
    return b;
  }
};`
        }))
      }
    }
  ],

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
      javaCode:
`Object[] obj = getValue();
if ( obj == null ) {
  stmt.setObject(null);
  return;
}
int length = obj.length;
if ( length == 0 ) {
  stmt.setObject(null);
  return;
}
StringBuilder builder = sb.get();
for ( int i = 0; i < length; i++ ) {
  if ( obj[i] == null )
    builder.append("");
  else 
    escapeCommasAndAppend(builder, obj[i]);
  if ( i < length - 1 ) {
    builder.append(",");
  }
}
stmt.setObject(builder.toString());`
    },
    {
      name: 'escapeCommasAndAppend',
      args: [
        {
          name: 'builder',
          javaType: 'StringBuilder'
        },
        {
          name: 'o',
          javaType: 'Object'
        }
      ],
      javaReturns: 'void',
      javaCode: 
`String s = o.toString();
//replace backslash to double backslash
s = s.replace("\\\\", "\\\\\\\\");
//replace comma to backslash+comma
s = s.replace(",", "\\\\,");
builder.append(s);
`
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Eq',

  methods: [
    {
      name: 'f',
      // TODO(adamvy): Is there a better option than all the Comparable casts?
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))==0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return " " + getArg1().createStatement() + " = " + getArg2().createStatement() + " ";'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Neq',

  methods: [
    {
      name: 'f',
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))!=0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return " " + getArg1().createStatement() + " <> " + getArg2().createStatement() + " ";'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lt',

  methods: [
    {
      name: 'f',
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))<0;'  
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return " " + getArg1().createStatement() + " < " + getArg2().createStatement() + " ";'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lte',

  methods: [
    {
      name: 'f',
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))<=0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return " " + getArg1().createStatement() + " <= " + getArg2().createStatement() + " ";'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gt',

  methods: [
    {
      name: 'f',
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))>0;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return " " + getArg1().createStatement() + " > " + getArg2().createStatement() + " ";'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gte',

  methods: [
    {
      name: 'f',
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))>=0;' 
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return " " + getArg1().createStatement() + " >= " + getArg2().createStatement() + " ";'
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
      name: 'partialEval',
      javaReturns: 'foam.mlang.predicate.Predicate',
      javaCode: 'if ( this.arg1_ instanceof Not )\n' +
      '      return ((Not)arg1_).arg1_;\n' +
      '    if ( arg1_.getClass().equals(Eq.class) ) {\n' +
      '      return new Neq(( (Binary) arg1_ ).getArg1(), ( (Binary) arg1_ ).getArg2());\n' +
      '    }\n' +
      '    if ( arg1_.getClass().equals(Gt.class) ) {\n' +
      '      return new Lte(( (Binary) arg1_ ).getArg1(), ( (Binary) arg1_ ).getArg2());\n' +
      '    }\n' +
      '    if ( arg1_.getClass().equals(Gte.class) ) {\n' +
      '      return new Lt(( (Binary) arg1_ ).getArg1(), ( (Binary) arg1_ ).getArg2());\n' +
      '    }\n' +
      '    if ( arg1_.getClass().equals(Lt.class) ) {\n' +
      '      return new Gte(( (Binary) arg1_ ).getArg1(), ( (Binary) arg1_ ).getArg2());\n' +
      '    }\n' +
      '    if ( arg1_.getClass().equals(Lte.class) ) {\n' +
      '      return new Gt(( (Binary) arg1_ ).getArg1(), ( (Binary) arg1_ ).getArg2());\n' +
      '    }\n' +
      '    return this;'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return " NOT (" + getArg1().createStatement() + ") ";'
    },

    {
      name: 'prepareStatement',
      javaReturns: 'void',
      javaThrows: [ 'java.sql.SQLException' ],
      args: [
        {
          name: 'stmt',
          javaType: 'foam.dao.pg.IndexedPreparedStatement'
        }
      ],
      javaCode: 'getArg1().prepareStatement(stmt);'
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
      // TODO: check for empty array
      javaCode: `return " (" + getArg1().createStatement() + " <> '') is not true ";`
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

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1',
      javaType: 'foam.mlang.order.Comparator',
      javaJSONParser: 'new foam.lib.json.ExprParser()'
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
      javaCode: 'return -1 * getArg1().compare(o1, o2);'
    },
    {
      name: 'createStatement',
      javaReturns: 'String',
      javaCode: 'return " " + getArg1().createStatement() + " DESC ";'
    },
    {
      name: 'prepareStatement',
      javaReturns: 'void',
      javaThrows: [ 'java.sql.SQLException' ],
      args: [
        {
          name: 'stmt',
          javaType: 'foam.dao.pg.IndexedPreparedStatement'
        }
      ],
      javaCode: " "
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
      javaCode: 'setValue(getValue() + ((Number) this.arg1_.f(obj)).doubleValue());'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Unary',

  methods: [
    {
      name: 'prepareStatement',
      javaReturns: 'void',
      javaThrows: [ 'java.sql.SQLException' ],
      args: [
        {
          name: 'stmt',
          javaType: 'foam.dao.pg.IndexedPreparedStatement'
        }
      ],
      javaCode: 'getArg1().prepareStatement(stmt);'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Binary',

  methods: [
    {
      name: 'prepareStatement',
      javaReturns: 'void',
      javaThrows: [ 'java.sql.SQLException' ],
      args: [
        {
          name: 'stmt',
          javaType: 'foam.dao.pg.IndexedPreparedStatement'
        }
      ],
      javaCode:
`getArg1().prepareStatement(stmt);
getArg2().prepareStatement(stmt);`
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Nary',

  methods: [
    {
      name: 'prepareStatement',
      javaReturns: 'void',
      javaThrows: [ 'java.sql.SQLException' ],
      args: [
        {
          name: 'stmt',
          javaType: 'foam.dao.pg.IndexedPreparedStatement'
        }
      ],
      javaCode:
`for ( Predicate predicate : getArgs() ) {
  predicate.prepareStatement(stmt);
}`
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