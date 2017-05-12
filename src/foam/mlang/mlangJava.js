/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.INTERFACE({
  refines: 'foam.mlang.Expr',

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
    },
    {
      name: 'partialEval',
      javaReturns: 'foam.mlang.Expr'
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

debugger;
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
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.False',

  methods: [
    {
      name: 'f',
      javaCode: 'return false;'
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
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Contains',

  methods: [
    {
      name: 'f',
      javaCode: 'String s1 = (String)getArg1().f(obj);\n'
                + 'String s2 = (String)getArg2().f(obj);\n'
                + 'return s1 != null ? s1.indexOf(s2) != -1 : false;\n'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.StartsWithIC',

  methods: [
    {
      name: 'f',
      javaCode: 'String arg2 = ((String)getArg2().f(obj)).toUpperCase();\n'
                + 'Object arg1 = getArg1().f(obj);\n'
                + 'if ( arg1 instanceof Object[] ) {\n'
                + '  Object[] values = (Object[])arg1;\n'
                + '  for ( int i = 0 ; i < values.length ; i++ ) {\n'
                + '    if ( ((String)values[i]).toUpperCase().startsWith(arg2) ) {\n'
                + '      return true;\n'
                + '    }\n'
                + '  }\n'
                + '  return false;'
                + '}'
                + 'String value = (String)arg1;\n'
                + 'return value.toUpperCase().startsWith(arg2);\n'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.Constant',

  methods: [
    {
      name: 'f',
      javaCode: 'return getValue();'
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
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Neq',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) != 0;'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lt',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) < 0;'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lte',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) <= 0;'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gt',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) > 0;'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gte',

  methods: [
    {
      name: 'f',
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) >= 0;'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Not',

  methods: [
    {
      name: 'f',
      javaCode: 'return ! getArg1().f(obj);'
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Has',

  methods: [
    {
      name: 'f',
      javaCode: 'Object value = getArg1().f(obj);'+
        'return ! (value == null || '+
          '(value instanceof String && ((String)value).length() == 0) || '+
          '(value.getClass().isArray() && java.lang.reflect.Array.getLength(value) == 0));'
    }
  ]
});


foam.INTERFACE({
  refines: 'foam.mlang.order.Comparator',

  methods: [
    {
      name: 'compare',
      args: [
        {
          name: 'o1',
          javaType: 'Object'
        },
        {
          name: 'o2',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'toIndex',
      javaSupport: false,
      args: [
        {
          name: 'tail'
        }
      ]
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
      javaCode: 'return -1 * getArg1().compare(o1, o2);'
    },
    {
      name: 'toString',
      javaCode: 'return "DESC(" + getArg1().toString() + ")";'
    },
    {
      name: 'orderTail',
      javaCode: 'return null;'
    },
    {
      name: 'orderPrimaryProperty',
      javaCode: 'return getArg1();'
    },
    {
      name: 'orderDirection',
      javaCode: 'Object ret = getArg1().orderDirection().reverse();' +
        'ret.setSrcOrder(this); return ret;'
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
