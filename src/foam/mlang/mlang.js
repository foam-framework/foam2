/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO(braden): Port the partialEval() code over here.

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Count',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink which counts number of objects put().',

  properties: [
    {
      class: 'Long',
      name: 'value'
    },
    {
      class: 'String',
      name: 'label',
      value: 'Count'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function() { this.value++ },
      swiftCode: 'value+=1',
      javaCode: 'setValue(this.getValue() + 1);'
    },
    {
      name: 'remove',
      code: function() { this.value-- },
      swiftCode: 'value-=1',
    },
    {
      name: 'reset',
      code: function() { this.value = 0 },
      swiftCode: 'value = 0',
    },
    function toString() { return 'COUNT()'; }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Sequence',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  properties: [
    {
      class: 'Array',
      type: 'foam.dao.Sink[]',
      name: 'args'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.args.forEach(function(a) { a.put(obj, s); });
      },
      javaCode: `for ( int i = 0 ; i < getArgs().length ; i++ ) {
  getArgs()[i].put(obj, sub);
}`
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.args.forEach(function(a) { a.remove(obj, s); });
      },
      javaCode: `for ( int i = 0 ; i < getArgs().length ; i++ ) {
  getArgs()[i].remove(obj, sub);
}`
    },
    {
      name: 'reset',
      code: function(s) {
        this.args.forEach(function(a) { a.reset(s); });
      },
      javaCode: `for ( int i = 0 ; i < getArgs().length ; i++ ) {
  getArgs()[i].reset(sub);
}`
    },
    function toString() {
      return 'SEQ(' + this.args.map(function(a) { return a.toString(); }).join(',') + ')';
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'NullSink',
  extends: 'foam.dao.AbstractSink',
  implements: ['foam.core.Serializable'],

  documentation: 'Null Pattern (do-nothing) Sink.',

  axioms: [
    foam.pattern.Singleton.create()
  ]
});


foam.INTERFACE({
  package: 'foam.mlang',
  name: 'F',

  documentation: 'F interface: f(obj) -> val.',

  methods: [
    {
      name: 'f',
      type: 'Any',
      args: [
        {
          name: 'obj',
          type: 'Any'
        }
      ]
    }
  ]
});


// Investigate: If we use "extends: 'foam.mlang.F'" it generates the content properly for both F and Expr.
// But we have the Constant that extends the AbstractExpr that implements Expr and in this case, the f method
// (that comes from the F) interface is "losing" its type and returning void instead of returning the same defined
// on the interface as it should.
foam.INTERFACE({
  package: 'foam.mlang',
  name: 'Expr',
  implements: [
    'foam.dao.SQLStatement',
    'foam.mlang.F',
  ],

  documentation: 'Expr interface extends F interface: partialEval -> Expr.',

  methods: [
    {
      name: 'partialEval',
      type: 'foam.mlang.Expr'
    },
    {
      name: 'authorize',
      flags: [ 'java' ],
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'ExprProperty',
  extends: 'FObjectProperty',

  documentation: 'Property for Expr values.',

  properties: [
    {
      name: 'adapt',
      value: function(_, o, p) { return p.adaptValue(o); }
    },
    {
      name: 'type',
      value: 'foam.mlang.Expr'
    },
    ['javaJSONParser', 'foam.lib.json.ExprParser.instance()'],
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.FObjectView',
        of: 'foam.mlang.Expr'
      }
    }
  ],

  methods: [
    function adaptValue(o) {
      if ( o === null )                           return foam.mlang.Constant.create({ value: null });
      if ( ! o.f && typeof o === 'function' )     return foam.mlang.predicate.Func.create({ fn: o });
      if ( typeof o !== 'object' )                return foam.mlang.Constant.create({ value: o });
      if ( o instanceof Date )                    return foam.mlang.Constant.create({ value: o });
      if ( Array.isArray(o) )                     return foam.mlang.Constant.create({ value: o });
      if ( foam.core.AbstractEnum.isInstance(o) ) return foam.mlang.Constant.create({ value: o });
      if ( foam.core.FObject.isInstance(o) ) {
           // TODO: Not all mlang expressions actually implement Expr
           // so we're just going to check for o.f
           //  ! foam.mlang.Expr.isInstance(o) )
        if ( ! foam.Function.isInstance(o.f) )      return foam.mlang.Constant.create({ value: o });
        return o;
      }
      if ( o.class && this.__context__.lookup(o.class, true) ) {
        return this.adaptValue(this.__context__.lookup(o.class).create(o, this));
      }
      if ( foam.core.FObject.isSubClass(o) ) {
        return foam.mlang.Constant.create({ value: o });
      }

      console.error('Invalid expression value: ', o);
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'ExprArrayProperty',
  extends: 'FObjectArray',
  requires: [
    'foam.mlang.ExprProperty'
  ],

  documentation: 'Property for Expr values.',

  properties: [
    ['of', 'foam.mlang.Expr'],
    {
      name: 'adaptArrayElement',
      value: function(o) {
        // TODO: This is probably a little hacky, should have a more
        // declarative way of saying all the ways things can be
        // adapted to an expression.
        return this.ExprProperty.prototype.adaptValue.call(this, o);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'SinkProperty',
  extends: 'FObjectProperty',
  properties: [
    {
      name: 'type',
      value: 'foam.dao.Sink'
    },
    ['javaJSONParser', 'foam.lib.json.FObjectParser.instance()'],
    {
      name: 'view',
      value: { class: 'foam.u2.view.FObjectView' }
    }
  ],

  documentation: 'Property for Sink values.'
});


foam.INTERFACE({
  package: 'foam.mlang.predicate',
  name: 'Predicate',

  implements: [ 'foam.dao.SQLStatement' ],

  documentation: 'Predicate interface: f(obj) -> boolean.',

  methods: [
    {
      name: 'f',
      type: 'Boolean',
      args: [
        {
          name: 'obj',
          type: 'Any'
        }
      ]
    },
    {
      name: 'partialEval',
      type: 'foam.mlang.predicate.Predicate',
    },
    {
      name: 'toIndex',
      flags: ['js'],
      args: [
        {
          name: 'tail',
          type: 'foam.dao.index.Index'
        }
      ],
      type: 'foam.dao.index.Index'
    },
    {
      name: 'toDisjunctiveNormalForm',
      flags: ['js', 'java'],
      javaSupport: false,
      type: 'foam.mlang.predicate.Predicate',
    },
    {
      name: 'authorize',
      flags: [ 'java' ],
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'PredicateProperty',
  extends: 'FObjectProperty',

  documentation: 'Property for Predicate values.',

  properties: [
    ['type', 'foam.mlang.predicate.Predicate'],
    {
      name: 'adapt',
      value: function(_, o) {
        if ( typeof o === 'function' && ! o.f ) return foam.mlang.predicate.Func.create({ fn: o });
        return o;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'PredicateArray',
  extends: 'FObjectArray',

  documentation: 'Property for storing arrays of Predicates.',

  properties: [
    {
      name: 'of',
      value: 'foam.mlang.predicate.Predicate'
    },
    [ 'type', 'foam.mlang.predicate.Predicate[]' ],
    {
      name: 'adaptArrayElement',
      // TODO?: Make into a multi-method?
      value: function(o) {
        if ( o === null ) return foam.mlang.Constant.create({ value: o });
        if ( ! o.f && typeof o === "function" ) return foam.mlang.predicate.Func.create({ fn: o });
        if ( typeof o !== "object" ) return foam.mlang.Constant.create({ value: o });
        if ( Array.isArray(o) ) return foam.mlang.Constant.create({ value: o });
        if ( o === true ) return foam.mlang.predicate.True.create();
        if ( o === false ) return foam.mlang.predicate.False.create();
        if ( foam.core.FObject.isInstance(o) ) return o;
        if ( o.class && this.__context__.lookup(o.class, true) ) {
          return this.adaptArrayElement(this.__context__.lookup(o.class).create(o, this));
        }
        console.error('Invalid expression value: ', o);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'AbstractPredicate',
  abstract: true,
  implements: [ 'foam.mlang.predicate.Predicate' ],

  documentation: 'Abstract Predicate base-class.',

  methods: [
    {
      name: 'f',
      type: 'Boolean',
      args: [
        {
          name: 'obj',
          type: 'Any'
        }
      ],
      javaCode: 'return false;',
      swiftCode: 'return false',
    },
    {
      name: 'toIndex',
      flags: ['js'],
      code: function() { },
    },

    {
      name: 'toDisjunctiveNormalForm',
      flags: ['js'],
      code: function() { return this },
      swiftCode: 'return self',
    },

    {
      name: 'partialEval',
      code: function() { return this },
      swiftCode: 'return self',
      javaCode: 'return this;'
    },

    function reduceAnd(other) {
      return foam.util.equals(this, other) ? this : null;
    },

    function reduceOr(other) {
      return foam.util.equals(this, other) ? this : null;
    },

    {
      name: 'toString',
      code: function toString() { return this.cls_.name; },
      javaCode: 'return classInfo_.getId();'
    },
    {
      name: 'createStatement',
      type: 'String',
      javaCode: 'return "";',
      swiftCode: 'return "";',
    },
    {
      name: 'prepareStatement',
      type: 'Void',
      javaThrows: [ 'java.sql.SQLException' ],
      args: [
        {
          name: 'stmt',
          javaType: 'foam.dao.jdbc.IndexedPreparedStatement'
        }
      ],
      javaCode: '//noop',
      swiftCode: '//noop'
    },
    {
      name: 'authorize',
      javaCode: `//noop`
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'AbstractExpr',
  abstract: true,
  implements: [ 'foam.mlang.Expr' ],

  documentation: 'Abstract Expr base-class.',

  methods: [
    {
      name: 'partialEval',
      code: function partialEval() { return this; },
      javaCode: 'return this;'
    },
    {
      name: 'createStatement',
      type: 'String',
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      javaThrows: [ 'java.sql.SQLException' ],
      args: [
        {
          name: 'stmt',
          javaType: 'foam.dao.jdbc.IndexedPreparedStatement'
        }
      ],
      javaCode: ' '
    },
    {
      name: 'authorize',
      type: 'Void',
      javaCode: `//noop`
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'True',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Expression which always returns true.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    {
      name: 'f',
      code: function() { return true; },
      swiftCode: 'return true',
      javaCode: 'return true;'
    },
    {
      name: 'partialEval',
      code: function() { return this },
      javaCode: 'return foam.mlang.MLang.TRUE;'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'False',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Expression which always returns false.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    {
      name: 'f',
      code: function f() { return false; },
      javaCode: 'return false;'
    },
    {
      name: 'createStatement',
      type: 'String',
      javaCode: 'return " 1 <> 1 ";',
      code: function() { return "1 <> 1"; }
    },
    {
      name: 'partialEval',
      code: function() { return this },
      javaCode: 'return foam.mlang.MLang.FALSE;'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Unary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  documentation: 'Abstract Unary (single-argument) Predicate base-class.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],

  methods: [
    function toIndex(tail) {
      return this.arg1 && this.arg1.toIndex(tail);
    },

    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.arg1.toString() + ')';
    },
    {
      name: 'prepareStatement',
      javaCode: 'getArg1().prepareStatement(stmt);'
    },
    {
      name: 'authorize',
      javaCode: `
        getArg1().authorize(x);
      `
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Absolute',
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'delegate'
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(obj) {
        return Math.abs(this.delegate.f(obj));
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'Mux',
  properties: [
    {
//      class: 'foam.mlang.ExprProperty',
      name: 'cond',
    },
    {
//      class: 'foam.mlang.ExprProperty',
      name: 'a',
    },
    {
  //    class: 'foam.mlang.ExprProperty',
      name: 'b'
    }
  ],
  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        if ( this.cond.f(obj) ) this.a.put(obj, s)
        else this.b.put(obj, s);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'Partition',
  properties: [
    {
      name: 'arg1'
    },
    {
      name: 'delegate'
    },
    {
      // TODO: Should be a map, but we need a HashMap in JS that
      // doesn't convert every key to a string.
      class: 'Array',
      name: 'partitions',
      factory: function() {
        return [];
      }
    }
  ],
  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.findPartition_(this.arg1.f(obj)).put(obj, s);
      }
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.findPartition_(this.arg1.f(obj)).remove(obj, s);
      }
    },
    {
      name: 'reset',
      code: function(s) {
        this.partitions.forEach(function(p) { p.reset(s); });
      }
    },
    {
      name: 'findPartition_',
      code: function(key) {
        for ( var i = 0 ; i < this.partitions.length ; i++ ) {
          if ( foam.util.equals(this.partitions[i][0], key) ) return this.partitions[i][1];
        }
        this.partitions.push([key, this.delegate.clone()]);
        return this.partitions[this.partitions.length - 1][1];
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Binary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  documentation: 'Abstract Binary (two-argument) Predicate base-class.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1',
      gridColumns: 6
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2',
      gridColumns: 6,
      adapt: function(old, nu, prop) {
        var value = prop.adaptValue(nu);
        var arg1 = this.arg1;
        if ( foam.mlang.Constant.isInstance(value) && arg1 && arg1.adapt )
          value.value = this.arg1.adapt.call(null, old, value.value, arg1);

        return value;
      },
      javaPreSet: `
        // Temporary Fix
        if ( val instanceof foam.mlang.Constant ) {

          foam.mlang.Constant c = (foam.mlang.Constant) val;
          Object value = c.getValue();

          // TODO: add castObject() method to PropertyInfo and use instead
          if ( getArg1() instanceof foam.core.AbstractLongPropertyInfo ) {
            foam.core.PropertyInfo prop1 = (foam.core.PropertyInfo) getArg1();
            if ( value instanceof String ) {
              c.setValue(Long.valueOf((String) value));
            } else if ( value instanceof Number ) {
              c.setValue(((Number) value).longValue());
            }
          }
        }
      `
    }
  ],

  methods: [
    function toIndex(tail) {
      return this.arg1 && this.arg1.toIndex(tail);
    },
    function toSummary() {
      return this.toString();
    },
    {
      name: 'toString',
      code: function() {
        return foam.String.constantize(this.cls_.name) + '(' +
            this.arg1.toString() + ', ' +
            this.arg2.toString() + ')';
      },
      javaCode: `
        return String.format("%s(%s, %s)", getClass().getSimpleName(), getArg1().toString(), getArg2().toString());
      `
    },
    {
      name: 'prepareStatement',
      javaCode: `getArg1().prepareStatement(stmt);
getArg2().prepareStatement(stmt);`
    },
    {
      name: 'authorize',
      javaCode: `
        getArg1().authorize(x);
        getArg2().authorize(x);
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Nary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  documentation: 'Abstract n-ary (many-argument) Predicate base-class.',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateArray',
      name: 'args'
    }
  ],

  methods: [
    function toSummary() {
      return this.toString();
    },
    {
      name: 'toString',
      code: function() {
        return foam.String.constantize(this.cls_.name) + '(' +
          this.args.map(a => a.toString()) + ')';
      },
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(getClass().getSimpleName()).append('(');
        for ( int i = 0; i < getArgs().length; i++ ) {
          if ( i > 0 ) sb.append(", ");
          sb.append(getArgs()[i].toString());
        }
        sb.append(')');
        return sb.toString();
      `
    },

    function reduce_(args, shortCircuit, methodName) {
      for ( var i = 0; i < args.length - 1; i++ ) {
        for ( var j = i + 1; j < args.length; j++ ) {
          if ( args[i][methodName] ) {
            var newArg = args[i][methodName](args[j]);
            if ( newArg ) {
              if ( newArg === shortCircuit ) return shortCircuit;
              args[i] = newArg;
              args.splice(j, 1);
            }
          }
        }
      }
      return args;
    },
    {
      name: 'prepareStatement',
      javaCode: `
        for ( Predicate predicate : getArgs() ) {
          predicate.prepareStatement(stmt);
        }
      `
    },
    {
      name: 'authorize',
      javaCode: `
        for ( Predicate predicate : getArgs() ) {
          predicate.authorize(x);
        }
      `
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Or',
  extends: 'foam.mlang.predicate.Nary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Logical Or n-ary Predicate.',

  requires: [
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.True'
  ],

  methods: [
    {
      name: 'f',
      code: function f(o) {
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          if ( this.args[i].f(o) ) return true;
        }
        return false;
      },
      swiftCode: `
for arg in args {
  if arg.f(obj) { return true }
}
return false
`,
      javaCode: 'for ( int i = 0 ; i < getArgs().length ; i++ ) {\n'
        + '  if ( getArgs()[i].f(obj) ) return true;\n'
        + '}\n'
        + 'return false;\n'
    },

    {
      name: 'createStatement',
      type: 'String',
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
    },

    {
      name: 'partialEval',
      code: function partialEval() {
        var newArgs = [];
        var updated = false;

        var TRUE  = this.True.create();
        var FALSE = this.False.create();

        for ( var i = 0 ; i < this.args.length ; i++ ) {
          var a    = this.args[i];
          var newA = this.args[i].partialEval();

          if ( newA === TRUE ) return TRUE;

          if ( this.cls_.isInstance(newA) ) {
            // In-line nested OR clauses
            for ( var j = 0 ; j < newA.args.length ; j++ ) {
              newArgs.push(newA.args[j]);
            }
            updated = true;
          }
          else {
            if ( newA !== FALSE ) {
              newArgs.push(newA);
            }
            if ( a !== newA ) updated = true;
          }
        }

        this.reduce_(newArgs, FALSE, 'reduceAnd');

        if ( newArgs.length === 0 ) return FALSE;
        if ( newArgs.length === 1 ) return newArgs[0];

        return updated ? this.cls_.create({ args: newArgs }) : this;
      },
      javaCode:
        `java.util.List<Predicate> args = new java.util.ArrayList<>();
boolean update = false;
for ( int i = 0; i < this.args_.length; i++ ) {
  Predicate arg = this.args_[i];
  Predicate newArg = this.args_[i].partialEval();
  if ( newArg == foam.mlang.MLang.TRUE ) return foam.mlang.MLang.TRUE;
  if ( newArg instanceof Or ) {
    for ( int j = 0; j < ( ( (Or) newArg ).args_.length ); j++ ) {
      args.add(( (Or) newArg ).args_[j]);
    }
    update = true;
  } else {
    if ( newArg == foam.mlang.MLang.FALSE || arg == null ) {
      update = true;
    } else {
      args.add(newArg);
      if ( ! arg.createStatement().equals(newArg.createStatement()) ) update = true;
    }
  }
}
if ( args.size() == 0 ) return foam.mlang.MLang.TRUE;
if ( args.size() == 1 ) return args.get(0);
if ( update ) {
  Predicate newArgs[] = new Predicate[args.size()];
  int i = 0;
  for ( Predicate predicate : args )
    newArgs[i++] = predicate;
  return new Or(newArgs);
}
return this;`
    },

    function toIndex(tail) { },

    function toDisjunctiveNormalForm() {
      // TODO: memoization around this process?
      // DNF our args, note if anything changes
      var oldArgs = this.args;
      var newArgs = [];
      var changed = false;
      for (var i = 0; i < oldArgs.length; i++ ) {
        var a = oldArgs[i].toDisjunctiveNormalForm();
        if ( a !== oldArgs[i] ) changed = true;
        newArgs[i] = a;
      }

      // partialEval will take care of nested ORs
      var self = this;
      if ( changed ) {
        self = this.clone();
        self.args = newArgs;
        self = self.partialEval();
      }

      return self;
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'And',
  extends: 'foam.mlang.predicate.Nary',
  implements: ['foam.core.Serializable'],

  documentation: 'Logical And n-ary Predicate.',

  requires: [
    'foam.mlang.predicate.Or'
  ],

  methods: [
    {
      name: 'f',
      code: function(o) {
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          if ( ! this.args[i].f(o) ) return false;
        }
        return true;
      },
      swiftCode: function() {/*
for arg in args {
  if !arg.f(obj) { return false }
}
return true
                             */},
      javaCode: 'for ( int i = 0 ; i < getArgs().length ; i++ ) {\n'
                + '  if ( ! getArgs()[i].f(obj) ) return false;\n'
                + '}\n'
                + 'return true;'
    },

    {
      name: 'createStatement',
      type: 'String',
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
      code: function partialEval() {
        var newArgs = [];
        var updated = false;

        var FALSE = foam.mlang.predicate.False.create();
        var TRUE  = foam.mlang.predicate.True.create();

        for ( var i = 0; i < this.args.length; i++ ) {
          var a    = this.args[i];
          var newA = this.args[i].partialEval();

          if ( newA === FALSE ) return FALSE;

          if ( this.cls_.isInstance(newA) ) {
            // In-line nested AND clauses
            for ( var j = 0 ; j < newA.args.length ; j++ ) {
              newArgs.push(newA.args[j]);
            }
            updated = true;
          }
          else {
            if ( newA === TRUE ) {
              updated = true;
            } else {
              newArgs.push(newA);
              if ( a !== newA ) updated = true;
            }
          }
        }

        this.reduce_(newArgs, TRUE, 'reduceOr');

        if ( newArgs.length === 0 ) return TRUE;
        if ( newArgs.length === 1 ) return newArgs[0];

        return updated ? this.cls_.create({ args: newArgs }) : this;
      },
      javaCode:
        `java.util.List<Predicate> args = new java.util.ArrayList<>();
boolean update = false;
for ( int i = 0; i < this.args_.length; i++ ) {
  Predicate arg = this.args_[i];
  Predicate newArg = this.args_[i].partialEval();
  if ( newArg == foam.mlang.MLang.FALSE ) return foam.mlang.MLang.FALSE;
  if ( newArg instanceof And ) {
    for ( int j = 0; j < ( ( (And) newArg ).args_.length ); j++ ) {
      args.add(( (And) newArg ).args_[j]);
    }
    update = true;
  } else {
    if ( newArg == foam.mlang.MLang.TRUE || newArg == null ) {
      update = true;
    } else {
      args.add(newArg);
      if ( ! arg.createStatement().equals(newArg.createStatement()) ) update = true;
    }
  }
}
if ( args.size() == 0 ) return foam.mlang.MLang.TRUE;
if ( args.size() == 1 ) return args.get(0);
if ( update ) {
  Predicate newArgs[] = new Predicate[args.size()];
  int i = 0;
  for ( Predicate predicate : args )
    newArgs[i++] = predicate;
  return new And(newArgs);
}
return this;`
    },


    function toIndex(tail, depth) {
      /** Builds the ideal index for this predicate. The indexes will be chained
          in order of index uniqueness (put the most indexable first):
          This prevents dropping to scan mode too early, and restricts
          the remaning set more quickly.
           i.e. EQ, IN,... CONTAINS, ... LT, GT...
        @param depth {number} The maximum number of sub-indexes to chain.
      */
      depth = depth || 99;

      if ( depth === 1 ) {
        // generate indexes, find costs, use the fastest
        var bestCost = Number.MAX_VALUE;
        var bestIndex;
        var args = this.args;
        for (var i = 0; i < args.length; i++ ) {
          var arg = args[i];
          var idx = arg.toIndex(tail);
          if ( ! idx ) continue;

          var idxCost = Math.floor(idx.estimate(
             1000, undefined, undefined, undefined, undefined, arg));

          if ( bestCost > idxCost ) {
            bestIndex = idx;
            bestCost = idxCost;
          }
        }
        return bestIndex;

      } else {
        // generate indexes, sort by estimate, chain as requested
        var sortedArgs = Object.create(null);
        var costs = [];
        var args = this.args;
        var dupes = {}; // avoid duplicate indexes
        for (var i = 0; i < args.length; i++ ) {
          var arg = args[i];
          var idx = arg.toIndex(tail);
          if ( ! idx ) continue;

          // duplicate check
          var idxString = idx.toString();
          if ( dupes[idxString] ) continue;
          dupes[idxString] = true;

          var idxCost = Math.floor(idx.estimate(
             1000, undefined, undefined, undefined, undefined, arg));
          // make unique with a some extra digits
          var costKey = idxCost + i / 1000.0;
          sortedArgs[costKey] = arg;
          costs.push(costKey);
        }
        costs = costs.sort(foam.Number.compare);

        // Sort, build list up starting at the end (most expensive
        //   will end up deepest in the index)
        var tailRet = tail;
        var chainDepth = Math.min(costs.length - 1, depth - 1);
        for ( var i = chainDepth; i >= 0; i-- ) {
          var arg = sortedArgs[costs[i]];
          //assert(arg is a predicate)
          tailRet = arg.toIndex(tailRet);
        }

        return tailRet;
      }
    },

    function toDisjunctiveNormalForm() {
      // for each nested OR, multiply:
      // AND(a,b,OR(c,d),OR(e,f)) -> OR(abce,abcf,abde,abdf)

      var andArgs = [];
      var orArgs  = [];
      var oldArgs = this.args;
      for (var i = 0; i < oldArgs.length; i++ ) {
        var a = oldArgs[i].toDisjunctiveNormalForm();
        if ( this.Or.isInstance(a) ) {
          orArgs.push(a);
        } else {
          andArgs.push(a);
        }
      }

      if ( orArgs.length > 0 ) {
        var newAndGroups = [];
        // Generate every combination of the arguments of the OR clauses
        // orArgsOffsets[g] represents the array index we are lookig at
        // in orArgs[g].args[offset]
        var orArgsOffsets = new Array(orArgs.length).fill(0);
        var active = true;
        var idx = orArgsOffsets.length - 1;
        orArgsOffsets[idx] = -1; // compensate for intial ++orArgsOffsets[idx]
        while ( active ) {
          while ( ++orArgsOffsets[idx] >= orArgs[idx].args.length ) {
            // reset array index count, carry the one
            if ( idx === 0 ) { active = false; break; }
            orArgsOffsets[idx] = 0;
            idx--;
          }
          idx = orArgsOffsets.length - 1;
          if ( ! active ) break;

          // for the last group iterated, read back up the indexes
          // to get the result set
          var newAndArgs = [];
          for ( var j = orArgsOffsets.length - 1; j >= 0; j-- ) {
            newAndArgs.push(orArgs[j].args[orArgsOffsets[j]]);
          }
          newAndArgs = newAndArgs.concat(andArgs);

          newAndGroups.push(
            this.cls_.create({ args: newAndArgs })
          );
        }
        return this.Or.create({ args: newAndGroups }).partialEval();
      } else {
        // no OR args, no DNF transform needed
        return this;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Contains',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff second arg found in first array argument.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o);
        if ( Array.isArray(arg1) ) {
          return arg1.some(function(a) {
            return a.indexOf(arg2) !== -1;
          })
        }
        return arg1 ? arg1.indexOf(arg2) !== -1 : false;
      },
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
      javaCode: `return " '" + getArg1().createStatement() + "' like '%" + getArg2().createStatement() + "%' ";`
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'ContainsIC',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff second arg found in first array argument, ignoring case.',

  methods: [
    {
      name: 'f',
      code: function f(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o).toUpperCase();
        if ( Array.isArray(arg1) ) {
          return arg1.some(function(a) {
            return a.toUpperCase().indexOf(arg2) !== -1;
          })
        }
        return arg1 ? arg1.toUpperCase().indexOf(arg2) !== -1 : false;
      },
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
      type: 'String',
      javaCode: `return " '" + getArg1().createStatement() + "' ilike '%" + getArg2().createStatement() + "%' ";`
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'StartsWith',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 starts with arg2 or if arg1 is an array, if an element starts with arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o);

        if ( Array.isArray(arg1) ) {
          return arg1.some(function(arg) {
            return arg.startsWith(arg2);
          });
        }

        return arg1.startsWith(arg2);
      },
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
      javaCode: `return " '" + getArg1().createStatement() + "' like '" + getArg2().createStatement() + "%' ";`
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'StartsWithIC',
  extends: 'foam.mlang.predicate.Binary',
  implements: ['foam.core.Serializable'],

  documentation: 'Predicate returns true iff arg1 starts with arg2 or if arg1 is an array, if an element starts with arg2, ignoring case.',

  methods: [
    {
      name: 'f',
      code: function f(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o);

        if ( Array.isArray(arg1) ) {
          return arg1.some(function(arg) {
            return foam.String.startsWithIC(arg, arg2);
          });
        }

        return foam.String.startsWithIC(arg1, arg2);
      },
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
      javaCode: `return " '" + getArg1().createStatement() + "' ilike '" + getArg2().createStatement() + "%' ";`
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'EndsWith',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 ends with arg2 or if arg1 is an array, if an element starts with arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o);

        if ( Array.isArray(arg1) ) {
          return arg1.some(function(arg) {
            return arg.endsWith(arg2);
          });
        }

        return arg1.endsWith(arg2);
      },
      javaCode: `
        Object arg1 = getArg1().f(obj);
        String arg2 = (String) getArg2().f(obj);
        if ( arg1 instanceof String[] ) {
          for ( String s : (String[]) arg1 ) {
            if ( s.endsWith(arg2) )
              return true;
          }
        }
        return ( arg1 instanceof String && ((String) arg1).endsWith(arg2) );
      `
    },
    {
      name: 'createStatement',
      javaCode: `return " '" + getArg1().createStatement() + "' like '%" + getArg2().createStatement() + "' ";`
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'ArrayBinary',
  extends: 'foam.mlang.predicate.Binary',
  abstract: true,

  documentation: 'Binary predicate that accepts an array in "arg2".',

  properties: [
    {
      name: 'arg2',
      postSet: function() {
        this.valueSet_ = null;
      },
      adapt: function(old, nu, prop) {
        var value = prop.adaptValue(nu);
        var arg1 = this.arg1;

        // Adapt constant array elements when:
        // (1) Value is a constant (array);
        // (2) Value is truthy (empty arrays can be serialized as undefined);
        // (3) Arg1 has an adapt().
        if ( foam.mlang.Constant.isInstance(value) && value.value &&
             arg1 && arg1.adapt ) {
          var arrayValue = value.value;
          for ( var i = 0; i < arrayValue.length; i++ ) {
            arrayValue[i] = arg1.adapt.call(null, old && old[i], arrayValue[i], arg1);
          }
        }

        return value;
      }
    },
    {
      // TODO: simpler to make an expression
      name: 'valueSet_',
      hidden: true
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'In',
  extends: 'foam.mlang.predicate.ArrayBinary',
  implements: [
    'foam.core.Serializable',
    { path: 'foam.mlang.Expressions', flags: ['js'], java: false }
  ],

  documentation: 'Predicate returns true iff arg1 is a substring of arg2, or if arg2 is an array, arg1 is an element of arg2.',

  requires: [ 'foam.mlang.Constant' ],

  javaImports: [
    'java.util.List',
    'foam.mlang.ArrayConstant',
    'foam.mlang.Constant'
  ],

  properties: [
    {
      name: 'arg1',
      postSet: function(old, nu) {
        // this is slightly slower when an expression on upperCase_
        this.upperCase_ = nu && foam.core.Enum.isInstance(nu);
      }
    },
    {
      name: 'upperCase_',
      hidden: 'true'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function f(o) {
        var lhs = this.arg1.f(o);
        var rhs = this.arg2.f(o);

        if ( ! rhs ) return false;

        for ( var i = 0 ; i < rhs.length ; i++ ) {
          var v = rhs[i];

          if ( foam.String.isInstance(v) && this.upperCase_ ) v = v.toUpperCase();
          if ( foam.util.equals(lhs, v) ) return true;
        }
        return false;

        // TODO: This is not a sufficient enough check for valueSet_.
        // We can have constants that contain other FObjects, in
        // particular with multi part id support.So this code path is
        // disabled for now.


        // If arg2 is a constant array, we use valueSet for it.
        if ( this.Constant.isInstance(this.arg2) ) {
          if ( ! this.valueSet_ ) {
            var set = {};
            for ( var i = 0 ; i < rhs.length ; i++ ) {
              var s = rhs[i];
              if ( this.upperCase_ ) s = s.toUpperCase();
              set[s] = true;
            }
            this.valueSet_ = set;
          }

          return !! this.valueSet_[lhs];
        }

        return rhs ? rhs.indexOf(lhs) !== -1 : false;
      },
      swiftCode: `
let lhs = arg1!.f(obj)
let rhs = arg2!.f(obj)
if ( rhs == nil ) {
  return false
}

if let values = rhs as? [Any] {
  for value in values {
    if ( FOAM_utils.equals(lhs, value) ) {
      return true
    }
  }
} else if let rhsStr = rhs as? String, let lhsStr = lhs as? String {
  return rhsStr.contains(lhsStr)
}

return false
      `,
      javaCode:
  `
  Object lhs = getArg1().f(obj);
  // boolean uppercase = lhs.getClass().isEnum(); TODO: Account for ENUMs? (See js)
  Object rhs = getArg2().f(obj);

  if ( rhs instanceof List ) {
    List list = (List) rhs;
    for ( Object o : list ) {
      if ( ( ( (Comparable) lhs ).compareTo( (Comparable) o ) ) == 0 ) {
        return true;
      }
    }
  } else if ( rhs instanceof Object[] ) {
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
      type: 'String',
      javaCode: 'return " " + getArg1().createStatement() + " in " + getArg2().createStatement();'
    },
    {
      name: 'partialEval',
      code: function partialEval() {
        if ( ! this.Constant.isInstance(this.arg2) ) return this;

        return ( ! this.arg2.value ) || this.arg2.value.length === 0 ?
            this.FALSE : this;
      },
      javaCode: `
        if ( ! (getArg2() instanceof ArrayConstant) ) return this;

        Object[] arr = ((ArrayConstant) getArg2()).getValue();

        if ( arr.length == 0 ) {
          return new False();
        } else if ( arr.length == 1 ) {
          return new Eq.Builder(getX())
            .setArg1(getArg1())
            .setArg2(new Constant(arr[0]))
            .build();
        }

        return this;
      `
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'InIC',
  extends: 'foam.mlang.predicate.ArrayBinary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 is a substring of arg2, or if arg2 is an array, is an element of arg2, case insensitive.',

  methods: [
    function f(o) {
      var lhs = this.arg1.f(o);
      var rhs = this.arg2.f(o);

      if ( lhs.toUpperCase ) lhs = lhs.toUpperCase();

      // If arg2 is a constant array, we use valueSet for it.
      if ( foam.mlang.Constant.isInstance(this.arg2) ) {
        if ( ! this.valueSet_ ) {
          var set = {};
          for ( var i = 0 ; i < rhs.length ; i++ ) {
            set[rhs[i].toUpperCase()] = true;
          }
          this.valueSet_ = set;
        }

        return !! this.valueSet_[lhs];
      } else {
        if ( ! rhs ) return false;
        return rhs.toUpperCase().indexOf(lhs) !== -1;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Constant',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'An Expression which always returns the same constant value.',

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function() { return this.value; },
      swiftCode: `return value`,
      javaCode: 'return getValue();'
    },
    {
      name: 'createStatement',
      javaCode: 'return " ? "; '
    },
    {
      name: 'prepareStatement',
      javaCode: 'stmt.setObject(getValue());'
    },

    function toString_(x) {
      return typeof x === 'number' ? '' + x :
        typeof x === 'string' ? '"' + x + '"' :
        Array.isArray(x) ? '[' + x.map(this.toString_.bind(this)).join(', ') + ']' :
        x && (x).toString();
    },

    {
      name: 'toString',
      code: function() { return this.toString_(this.value); },
      javaCode: 'return getValue().toString();'
    },

    // TODO(adamvy): Re-enable when we can parse this in java more correctly.
    function xxoutputJSON(os) {
      os.output(this.value);
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'ArrayConstant',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable'],

  properties: [
    {
      class: 'Array',
      name: 'value'
    }
  ],

  javaImports: [ 'java.util.Arrays' ],

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
      code: function() { return this.value; },
      swiftCode: 'return value',
      javaCode: 'return getValue();',
    },
    {
      name: 'createStatement',
      javaCode: 'return " ? "; '
    },
    {
      name: 'prepareStatement',
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
          type: 'Any'
        }
      ],
      type: 'Void',
      javaCode:
`String s = o.toString();
//replace backslash to double backslash
s = s.replace("\\\\", "\\\\\\\\");
//replace comma to backslash+comma
s = s.replace(",", "\\\\,");
builder.append(s);
`
    },
    {
      name: 'toString',
      code: function() {
        return Array.isArray(this.value) ? '[' + this.value.map(this.toString_.bind(this)).join(', ') + ']' :
          this.value.toString ? this.value.toString :
          x;
      },
      javaCode: `
        return Arrays.toString(getValue());
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Func',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  documentation: 'A function to Predicate adapter.',

  // TODO: rename FunctionPredicate

  properties: [
    {
      /** The function to apply to objects passed to this expression */
      name: 'fn'
    }
  ],

  methods: [
    function f(o) { return this.fn(o); },
    function toString() {
      return 'FUNC(' + fn.toString() + ')';
    }
  ]
});


/** Binary expression for equality of two arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Eq',
  extends: 'foam.mlang.predicate.Binary',

  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 EQUALS arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var v1 = this.arg1.f(o);
        var v2 = this.arg2.f(o);

        // TODO This first check shouldn't be necessary.
        // First check is so that EQ(Class.PROPERTY, null | undefined) works.
        return ( v1 === undefined && v2 === null ) || foam.util.equals(v1, v2);
      },
      swiftCode: `
let v1 = arg1!.f(obj)
let v2 = arg2!.f(obj)
return FOAM_utils.equals(v1, v2)
      `,
      javaCode: 'return foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))==0;'
    },
    {
      name: 'createStatement',
      javaCode: 'return " " + getArg1().createStatement() + " = " + getArg2().createStatement() + " ";'
    },

    function reduceAnd(other) {
      var myArg1           = this.arg1;
      var myArg2           = this.arg2;
      var otherArg1        = other.arg1;
      var otherArg2        = other.arg2;
      var isConst          = foam.mlang.Constant.isInstance.bind(foam.mlang.Constant);
      var myArg1IsConst    = isConst(myArg1);
      var myArg2IsConst    = isConst(myArg2);
      var otherArg1IsConst = isConst(otherArg1);
      var otherArg2IsConst = isConst(otherArg2);

      // Require one const, one non-const in this and other.
      if ( myArg1IsConst === myArg2IsConst || otherArg1IsConst === otherArg2IsConst )
        return this.SUPER(other);

      // Require same expr.
      var myExpr    = myArg1IsConst ? myArg2 : myArg1;
      var otherExpr = otherArg1IsConst ? otherArg2 : otherArg1;
      var equals    = foam.util.equals;

      if ( ! equals(myExpr, otherExpr) ) return this.SUPER(other);

      // Reduce to FALSE when consts are not equal.
      var myConst    = myArg1IsConst    ? myArg1    : myArg2;
      var otherConst = otherArg1IsConst ? otherArg1 : otherArg2;

      return equals(myConst, otherConst) ? this.SUPER(other) : this.FALSE;
    }
  ]
});


/** Binary expression for inequality of two arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Neq',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 does NOT EQUAL arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var v1 = this.arg1.f(o);
        var v2 = this.arg2.f(o);

        // TODO This first check shouldn't be necessary.
        return  ( v1 !== undefined || v2 !== null ) && ! foam.util.equals(v1, v2);
      },
      swiftCode: `
let v1 = arg1!.f(obj)
let v2 = arg2!.f(obj)
return !FOAM_utils.equals(v1, v2)
`,
      javaCode: 'return foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))!=0;'
    },
    {
      name: 'createStatement',
      javaCode: 'return " " + getArg1().createStatement() + " <> " + getArg2().createStatement() + " ";'
    }
  ]
});


/** Binary expression for "strictly less than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lt',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is LESS THAN arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) < 0;
      },
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))<0;'
    },
    {
      name: 'createStatement',
      javaCode: 'return " " + getArg1().createStatement() + " < " + getArg2().createStatement() + " ";'
    }
  ]
});


/** Binary expression for "less than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lte',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is LESS THAN or EQUAL to arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) <= 0;
      },
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))<=0;'
    },
    {
      name: 'createStatement',
      javaCode: 'return " " + getArg1().createStatement() + " <= " + getArg2().createStatement() + " ";'
    }
  ]
});


/** Binary expression for "strictly greater than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gt',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is GREATER THAN arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) > 0;
      },
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))>0;'
    },
    {
      name: 'createStatement',
      javaCode: 'return " " + getArg1().createStatement() + " > " + getArg2().createStatement() + " ";'
    }
  ]
});


/** Binary expression for "greater than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gte',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is GREATER THAN or EQUAL to arg2.',


  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) >= 0;
      },
      javaCode: 'return  foam.util.SafetyUtil.compare(getArg1().f(obj),getArg2().f(obj))>=0;'
    },
    {
      name: 'createStatement',
      javaCode: 'return " " + getArg1().createStatement() + " >= " + getArg2().createStatement() + " ";'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Has',
  extends: 'foam.mlang.predicate.Unary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Unary Predicate that returns true iff the given property has a value other than null, undefined, \'\', or [].',

  requires: [
    'foam.mlang.expr.PropertyExpr'
  ],

  properties: [
    {
      name: 'arg1',
      factory: function() {
        return this.PropertyExpr.create();
      }
    }
  ],

  methods: [
    {
      name: 'f',
      code: function f(obj) {
        var value = this.arg1.f(obj);

        return ! (
          value === 0         ||
          value === undefined ||
          value === null      ||
          value === ''        ||
          (Array.isArray(value) && value.length === 0) );
      },
      // TODO(kgr): Instead of checking type, use polymorphims and add a
      // type-specific has() method to the Property.
      javaCode: `Object value = getArg1().f(obj);
        return ! (value == null ||
          (value instanceof Number && ((Number) value).intValue() == 0) ||
          (value instanceof String && ((String) value).length() == 0) ||
          (value.getClass().isArray() && java.lang.reflect.Array.getLength(value) == 0));`
    },
    {
      name: 'createStatement',
      // TODO: check for empty array
      javaCode: `return " (" + getArg1().createStatement() + " <> '') is not true ";`
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Not',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Unary Predicate which negates the value of its argument.',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'arg1'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function f(obj) { return ! this.arg1.f(obj); },
      javaCode: 'return ! getArg1().f(obj);'
    },

    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.arg1.toString() + ')';
    },
    {
      name: 'partialEval',
      code: function() { return this; },
      javaCode:
      `Not predicate = (Not) this.fclone();
    if ( this.arg1_ instanceof Not )
      return ( (Not) arg1_ ).arg1_.partialEval();
    if ( arg1_.getClass().equals(Eq.class) ) {
      return new Neq.Builder(null)
        .setArg1(( (Binary) arg1_ ).getArg1())
        .setArg2(( (Binary) arg1_ ).getArg2())
        .build();
    }
    if ( arg1_.getClass().equals(Neq.class) ) {
      return new Eq.Builder(null)
        .setArg1(( (Binary) arg1_ ).getArg1())
        .setArg2(( (Binary) arg1_ ).getArg2())
        .build();
    }
    if ( arg1_.getClass().equals(Gt.class) ) {
      return new Lte.Builder(null)
        .setArg1(( (Binary) arg1_ ).getArg1())
        .setArg2(( (Binary) arg1_ ).getArg2())
        .build();
    }
    if ( arg1_.getClass().equals(Gte.class) ) {
      return new Lt.Builder(null)
        .setArg1(( (Binary) arg1_ ).getArg1())
        .setArg2(( (Binary) arg1_ ).getArg2())
        .build();
    }
    if ( arg1_.getClass().equals(Lt.class) ) {
      return new Gte.Builder(null)
        .setArg1(( (Binary) arg1_ ).getArg1())
        .setArg2(( (Binary) arg1_ ).getArg2())
        .build();
    }
    if ( arg1_.getClass().equals(Lte.class) ) {
      return new Gt.Builder(null)
        .setArg1(( (Binary) arg1_ ).getArg1())
        .setArg2(( (Binary) arg1_ ).getArg2())
        .build();
    }
    if ( predicate.arg1_.getClass().equals(And.class) ) {
      int len = ( (And) predicate.getArg1() ).args_.length;
      for ( int i = 0; i < len; i++ ) {
        ( (And) predicate.getArg1() ).args_[i] = ( new Not.Builder(null).setArg1((( (And) predicate.getArg1() ).args_[i]) ).build().partialEval() );
      }
      return new Or.Builder(null).setArgs(( (And) predicate.getArg1() ).args_).build().partialEval();
    }
    if ( predicate.arg1_.getClass().equals(Or.class) ) {
      int len = ( (Or) predicate.getArg1() ).args_.length;
      for ( int i = 0; i < len; i++ ) {
        ( (Or) predicate.getArg1() ).args_[i] = ( new Not.Builder(null).setArg1((( (Or) predicate.getArg1() ).args_[i]) ).build().partialEval() );
      }
      return new And.Builder(null).setArgs((( (Or) predicate.getArg1() ).args_)).build().partialEval();
    }
return this;`
    },
    {
      name: 'createStatement',
      javaCode: 'return " NOT (" + getArg1().createStatement() + ") ";'
    },

    {
      name: 'prepareStatement',
      javaCode: 'getArg1().prepareStatement(stmt);'
    },
    {
      name: 'authorize',
      javaCode: `
        getArg1().authorize(x);
      `
    }


    /*
      TODO: this isn't ported to FOAM2 yet.
    function partialEval() {
      return this;
      var newArg = this.arg1.partialEval();

      if ( newArg === TRUE ) return FALSE;
      if ( newArg === FALSE ) return TRUE;
      if ( NotExpr.isInstance(newArg) ) return newArg.arg1;
      if ( EqExpr.isInstance(newArg)  ) return NeqExpr.create(newArg);
      if ( NeqExpr.isInstance(newArg) ) return EqExpr.create(newArg);
      if ( LtExpr.isInstance(newArg)  ) return GteExpr.create(newArg);
      if ( GtExpr.isInstance(newArg)  ) return LteExpr.create(newArg);
      if ( LteExpr.isInstance(newArg) ) return GtExpr.create(newArg);
      if ( GteExpr.isInstance(newArg) ) return LtExpr.create(newArg);

      return this.arg1 === newArg ? this : NOT(newArg);
    }*/
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'IsInstanceOf',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate which checks if objects are instances of the specified class.',

  properties: [
    {
      class: 'Class',
      name: 'targetClass',
      javaType: 'foam.core.ClassInfo',
      view: {
        class: 'foam.u2.view.StrategizerChoiceView',
        desiredModelId: 'foam.Class'
      }
    }
  ],

  methods: [
    {
      name: 'f',
      code: function f(obj) { return this.targetClass.isInstance(obj); },
      javaCode: 'return getTargetClass().isInstance(obj);'
    },

    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.targetClass.id + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Keyword',
  extends: 'foam.mlang.predicate.Unary',
  implements: [ 'foam.core.Serializable' ],

  javaImports: [
    'foam.core.PropertyInfo',
    'java.lang.reflect.Method',
    'java.text.DateFormat',
    'java.text.SimpleDateFormat',
    'java.util.Date',
    'java.util.Iterator',
    'java.util.List',
    'java.util.TimeZone'
  ],

  documentation: 'Unary Predicate for generic keyword search (searching all String properties for argument substring).',

  requires: [
    {
      name: 'String',
      path: 'foam.core.String',
      flags: ['js'],
    },
    {
      name: 'FObjectProperty',
      path: 'foam.core.FObjectProperty',
      flags: ['js'],
    },
    {
      name: 'Long',
      path: 'foam.core.Long',
      flags: ['js']
    },
    {
      name: 'Enum',
      path: 'foam.core.Enum',
      flags: ['js']
    },
    {
      name: 'Date',
      path: 'foam.core.Date',
      flags: ['js']
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'checkingNestedFObject_',
      value: false,
      transient: true,
      visibility: 'HIDDEN',
      documentation: 'Support keyword search on the first level nested FObject.'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function f(obj) {
        var arg = this.arg1.f(obj);
        if ( ! arg || typeof arg !== 'string' ) return false;

        arg = arg.toLowerCase();

        try {
          var s = '';
          const props = obj.cls_.getAxiomsByClass(foam.core.Property);
          for ( let i = 0; i < props.length; i++ ) {
            const prop = props[i];
            if ( this.FObjectProperty.isInstance(prop) ) {
              if ( this.checkNestedFObject(prop.f(obj)) ) return true;
            } else if ( this.Enum.isInstance(prop) ) {
              s = prop.f(obj).label.toLowerCase();
            } else if ( this.Long.isInstance(prop) ) {
              s = prop.f(obj).toString().toLowerCase();
            } else if ( this.Date.isInstance(prop) ) {
              s = prop.f(obj).toISOString().toLowerCase();
            } else if ( ! this.String.isInstance(prop) ) {
              continue;
            } else {
              s = prop.f(obj).toLowerCase();
            }
          }

          if ( s.toLowerCase().includes(arg) ) return true;
        } catch (err) {}

        return false;
      },
      javaCode: `
if ( ! ( getArg1().f(obj) instanceof String ) ) return false;

String arg1 = ((String) getArg1().f(obj)).toUpperCase();
List props = ((foam.core.FObject) obj).getClassInfo().getAxiomsByClass(PropertyInfo.class);
Iterator i = props.iterator();

while ( i.hasNext() ) {
  PropertyInfo prop = (PropertyInfo) i.next();

  try {
    String s = "";
    if ( prop instanceof foam.core.AbstractFObjectPropertyInfo ) {
      if ( checkNestedFObject(prop.f(obj)) ) return true;
    } else if ( prop instanceof foam.core.AbstractEnumPropertyInfo ) {
      Object value = prop.f(obj);
      if ( value == null ) continue;
      Class c = value.getClass();
      try {
        Method m = c.getMethod("getLabel");
        s = (String) m.invoke(value);
      } catch (Throwable t) {
        s = value.toString();
      }
    } else if ( prop instanceof foam.core.AbstractLongPropertyInfo ) {
      s = Long.toString((long) prop.f(obj));
    } else if ( prop instanceof foam.core.AbstractDatePropertyInfo ) {
      Date d = (Date) prop.f(obj);
      if ( d == null ) continue;

      // We do this to match JavaScript's 'toISOString' method which we use to
      // display dates in tables.
      DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'"); // Quoted "Z" to indicate UTC, no timezone offset
      df.setTimeZone(TimeZone.getTimeZone("UTC"));
      s = df.format(d);
    } else if ( ! ( prop instanceof foam.core.AbstractStringPropertyInfo ) ) {
      continue;
    } else {
      s = ((String) prop.f(obj));
    }

    if ( s.toUpperCase().contains(arg1) ) return true;
  } catch (Throwable t) {}
}

return false;`
    },
    {
      name: 'checkNestedFObject',
      type: 'Boolean',
      args: [
        { name: 'obj', type: 'Any' }
      ],
      code: function(obj) {
        if ( obj === undefined || obj === null || this.checkingNestedFObject_ ) {
          return false;
        }
        this.checkingNestedFObject_ = true;
        return this.f(obj);
      },
      javaCode: `
        if ( obj == null || getCheckingNestedFObject_() ) return false;
        setCheckingNestedFObject_(true);
        return this.f(obj);
      `
    },
    {
      name: 'toString',
      code: function() { return 'Keyword(' + this.arg1.toString() + ')'; },
      javaCode: 'return "Keyword(" + getArg1().toString() + ")";'
    }
  ]
});


/** Map sink transforms each put with a given mapping expression. */
foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Map',
  extends: 'foam.dao.ProxySink',

  documentation: 'Sink Decorator which applies a map function to put() values before passing to delegate.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],

  methods: [
    {
      name: 'f',
      type: 'Any',
      args: [ { name: 'obj', type: 'Any' } ],
      code: function f(obj) { return this.arg1.f(obj); },
      swiftCode: `return arg1?.f(obj)`,
      javaCode: `return getArg1().f(obj);`
    },

    {
      name: 'put',
      code: function put(o, sub) { this.delegate.put(this.f(o), sub); },
      swiftCode: `delegate.put(f(obj)!, sub)`,
      javaCode: 'getDelegate().put(f(obj), sub);'
    },

    function toString() {
      return 'MAP(' + this.arg1.toString() + ',' + this.f.toString() + ')';
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'GroupBy',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink which behaves like the SQL group-by command.',

  // TODO: it makes no sense to name the arguments arg1 and arg2
  // because this isn't an expression, so they should be more meaningful
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.SinkProperty',
      name: 'arg2'
    },
    {
      class: 'Int',
      name: 'groupLimit',
      value: -1
    },
    {
      class: 'Map',
      name: 'groups',
      hidden: true,
      factory: function() { return {}; },
      javaFactory: 'return new java.util.HashMap<Object, foam.dao.Sink>();'
    },
    {
      class: 'List',
      hidden: true,
      name: 'groupKeys',
      javaFactory: 'return new java.util.ArrayList();',
      factory: function() { return []; }
    },
    {
      class: 'Boolean',
      hidden: true,
      name: 'processArrayValuesIndividually',
      documentation: 'If true, each value of an array will be entered into a separate group.',
      factory: function() {
        // TODO: it would be good if it could also detect RelationshipJunction.sourceId/targetId
        return ! foam.core.MultiPartID.isInstance(this.arg1);
      }
    }
  ],

  methods: [
    {
      name: 'sortedKeys',
      javaType: 'java.util.List',
      args: [
        {
          name: 'comparator',
          type: 'foam.mlang.order.Comparator'
        }
      ],
      code: function sortedKeys(opt_comparator) {
        this.groupKeys.sort(opt_comparator || this.arg1.comparePropertyValues);
        return this.groupKeys;
      },
      javaCode:
`if ( comparator != null ) {
  java.util.Collections.sort(getGroupKeys(), comparator);
} else {
  java.util.Collections.sort(getGroupKeys());
}
return getGroupKeys();`
    },
    {
      name: 'putInGroup_',
      args: [
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        },
        {
          name: 'key',
          type: 'Object'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      code: function putInGroup_(sub, key, obj) {
        var group = this.groups.hasOwnProperty(key) && this.groups[key];
        if ( ! group ) {
          group = this.arg2.clone();
          this.groups[key] = group;
          this.groupKeys.push(key);
        }
        group.put(obj, sub);
        this.pub('propertyChange', 'groups');
      },
      javaCode:
`foam.dao.Sink group = (foam.dao.Sink) getGroups().get(key);
 if ( group == null ) {
   group = (foam.dao.Sink) (((foam.core.FObject)getArg2()).fclone());
   getGroups().put(key, group);
   getGroupKeys().add(key);
 }
 group.put(obj, sub);`
    },
    function reset() {
      this.arg2.reset();
      this.groups    = undefined;
      this.groupKeys = undefined;
    },
    {
      name: 'put',
      code: function put(obj, sub) {
        var key = this.arg1.f(obj);
        if ( this.processArrayValuesIndividually && Array.isArray(key) ) {
          if ( key.length ) {
            for ( var i = 0; i < key.length; i++ ) {
              this.putInGroup_(sub, key[i], obj);
            }
          } else {
            // Perhaps this should be a key value of null, not '', since '' might
            // actually be a valid key.
            this.putInGroup_(sub, '', obj);
          }
        } else {
          this.putInGroup_(sub, key, obj);
        }
        if ( this.groupLimit == this.groups.size ) sub.detach();
      },
      javaCode:
`Object arg1 = getArg1().f(obj);
if ( getProcessArrayValuesIndividually() && arg1 instanceof Object[] ) {
  Object[] keys = (Object[]) arg1;
  for ( Object key : keys ) {
    putInGroup_(sub, key, obj);
  }
} else {
  putInGroup_(sub, arg1, obj);
}
/*
if ( getGroupLimit() != -1 ) {
  System.err.println("************************************* " + getGroupLimit() + " " + getGroups().size() + " " + sub);
  Thread.dumpStack();
}*/
if ( getGroupLimit() == getGroups().size() && sub != null ) sub.detach();
`
    },

    function eof() { },

    {
      // TODO(adamvy): Is this right?  Seems like we should be overriding the foam2
      // fclone or deepClone method.
      name: 'clone',
      type: 'foam.mlang.sink.GroupBy',
      code: function clone() {
        // Don't use the default clone because we don't want to copy 'groups'.
        return this.cls_.create({ arg1: this.arg1, arg2: this.arg2 });
      },
      javaCode:
`GroupBy clone = new GroupBy();
clone.setArg1(this.getArg1());
clone.setArg2(this.getArg2());
return clone;`
    },

    {
      name: 'toString',
      code: function toString() {
        return 'groupBy(' + this.arg1 + "," + this.arg2 + "," + this.groupLimit + ')';
      },
      javaCode: 'return this.getGroups().toString();'
    },

    function toE(_, x) {
      return x.E('table').
        add(this.slot(function(arg1, groups) {
          return x.E('tbody').
            forEach(Object.keys(groups), function(g) {
              this.start('tr').
                start('td').add(g).end().
                start('td').add(groups[g]).end()
            });
        }));
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Projection',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  javaImports: [
    'foam.mlang.Expr',
    'java.util.StringJoiner'
  ],

  properties: [
    {
      class: 'Array',
      type: 'foam.mlang.Expr[]',
      name: 'exprs'
    },
    {
      class: 'List',
      name: 'array',
      factory: function() { return []; },
      javaFactory: `return new java.util.ArrayList();`
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(o, sub) {
        var a = [];
        for ( var i = 0 ; i < this.exprs.length ; i++ )
          a[i] = this.exprs[i].f(o);
        this.array.push(a);
      },
// TODO:      swiftCode: 'array.append(obj)',
      javaCode: `
        Object[] a = new Object[getExprs().length];

        for ( int i = 0 ; i < getExprs().length ; i++ )
          a[i] = getExprs()[i].f(obj);

        getArray().add(a);
      `
    },
    {
      name: 'toString',
      code: function() {
        return this.cls_.name + '(' + this.exprs.join(',') + ')';
      },
      javaCode: `
        StringJoiner joiner = new StringJoiner(", ", getClassInfo().getId() + "(", ")");

        for ( Expr expr : getExprs() ) {
          joiner.add(expr.toString());
        }

        return joiner.toString();
      `
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Plot',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  properties: [
    {
      class: 'foam.mlang.ExprArrayProperty',
      name: 'args'
    },
    {
      class: 'List',
      name: 'data',
      factory: function() { return []; }
    }
  ],
  methods: [
    {
      name: 'put',
      code: function put(obj) {
        this.data.push(this.args.map(a => a.f(obj)));
      },
      javaCode: `
        Object[] args = new Object[getArgs().length];
        for ( int i = 0; i < getArgs().length ; i++ ) {
          args[i] = getArgs()[i].f(obj);
        }
        getData().add(args);
      `
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Unique',
  extends: 'foam.dao.ProxySink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink decorator which only put()\'s a single obj for each unique expression value.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'expr'
    },
    {
      name: 'values',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function putInGroup_(key, obj) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];
      if ( ! group ) {
        group = this.arg2.clone();
        this.groups[key] = group;
        this.groupKeys.push(key);
      }
      group.put(obj);
    },

    function put(obj, sub) {
      var value = this.expr.f(obj);
      if ( Array.isArray(value) ) {
        throw 'Unique doesn\'t Array values.';
      } else {
        if ( ! this.values.hasOwnProperty(value) ) {
          this.values[value] = obj;
          this.delegate.put(obj);
        }
      }
    },

    function eof() { },

    function clone() {
      // Don't use the default clone because we don't want to copy 'uniqueValues'.
      return this.cls_.create({ expr: this.expr, delegate: this.delegate });
    },

    function toString() {
      return this.uniqueValues.toString();
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Explain',
  extends: 'foam.dao.ProxySink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Pseudo-Sink which outputs a human-readable description of an MDAO\'s execution plan for evaluating it.',

  properties: [
    {
      class: 'String',
      name:  'plan',
      help:  'Execution Plan'
    }
  ],

  methods: [
    function toString() { return this.plan; },
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'PropertyComparatorRefinement',
  refines: 'foam.core.Property',

  implements: [ 'foam.mlang.order.Comparator' ],

  methods: [
    {
      name: 'orderTail',
      code: function() { return; },
      javaCode: 'return null;'
    },
    {
      name: 'orderPrimaryProperty',
      code: function() { return this; },
      javaCode: 'return this;'
    },
    {
      name: 'orderDirection',
      code: function() { return 1; },
      javaCode: 'return 1;'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.order',
  name: 'Desc',

  implements: [
    'foam.mlang.order.Comparator',
    'foam.core.Serializable',
    'foam.dao.SQLStatement'
  ],

  documentation: 'Comparator Decorator which reverses direction of comparison. Short for "descending".',

  properties: [
    {
      class: 'FObjectProperty',
      name: 'arg1',
      type: 'foam.mlang.order.Comparator',
      adapt: function(_, c) { return foam.compare.toCompare(c); },
      javaJSONParser: 'foam.lib.json.ExprParser.instance()'
    }
  ],

  methods: [
    {
      name: 'compare',
      code: function compare(o1, o2) {
        return -1 * this.arg1.compare(o1, o2);
      },
      javaCode: 'return -1 * getArg1().compare(o1, o2);',
      swiftCode: 'return -1 * self.arg1!.compare(o1, o2);'
    },
    {
      name: 'createStatement',
      javaCode: 'return " " + getArg1().createStatement() + " DESC ";'
    },
    {
      name: 'prepareStatement',
      javaCode: '//noop'
    },
    {
      name: 'toString',
      code: function toString() { return 'DESC(' + this.arg1.toString() + ')'; },
      javaCode: 'return "DESC(" + getArg1().toString() + ")";'
    },
    function toIndex(tail) { return this.arg1 && this.arg1.toIndex(tail); },
    function orderTail() { return; },
    function orderPrimaryProperty() { return this.arg1; },
    function orderDirection() { return -1 * this.arg1.orderDirection(); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.order',
  name: 'ThenBy',

  implements: [
    'foam.core.Serializable',
    'foam.mlang.order.Comparator'
  ],

  documentation: 'Binary Comparator, which sorts for first Comparator, then second.',

  properties: [
    {
      class: 'FObjectProperty',
      type: 'foam.mlang.order.Comparator',
      adapt: function(_, a) {
        // TODO(adamvy): We should fix FObjectProperty's default adapt when the
        // of parameter is an interface rather than a class.
        return a;
      },
      javaJSONParser: 'foam.lib.json.ExprParser.instance()',
      name: 'head'
    },
    {
      class: 'FObjectProperty',
      type: 'foam.mlang.order.Comparator',
      adapt: function(_, a) {
        // TODO(adamvy): We should fix FObjectProperty's default adapt when the
        // of parameter is an interface rather than a class.
        return a;
      },
      javaJSONParser: 'foam.lib.json.ExprParser.instance()',
      name: 'tail'
    }
  ],

  methods: [
    {
      name: 'compare',
      code: function(o1, o2) {
        // an equals of arg1.compare is falsy, which will then hit arg2
        return this.head.compare(o1, o2) || this.tail.compare(o1, o2);
      },
      javaCode: `
        int ret = getHead().compare(o1, o2);
        return ret == 0 ? getTail().compare(o1, o2) : ret;
      `
    },
    {
      name: 'toString',
      code: function() {
        return 'THEN_BY(' + this.head.toString() + ', ' +
          this.tail.toString() + ')';
      },
      javaCode: 'return "THEN_BY " + getHead().toString() + ", " + getTail().toString();'

    },
    {
      name: 'createStatement',
      javaCode: `return null;`
    },
    {
      name: 'prepareStatement',
      javaCode: `return;`
    },
    function toIndex(tail) {
      return this.head && this.tail && this.head.toIndex(this.tail.toIndex(tail));
    },

    function orderTail() { return this.tail; },

    function orderPrimaryProperty() { return this.head.orderPrimaryProperty(); },

    function orderDirection() { return this.head.orderDirection(); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.order',
  name: 'CustomComparator',
  implements: [ 'foam.mlang.order.Comparator' ],

  // TODO: rename FunctionComparator

  documentation: 'A function to Comparator adapter.',

  properties: [
    {
      class: 'Function',
      name: 'compareFn'
    }
  ],

  methods: [
    {
      name: 'compare',
      code: function(o1, o2) {
        return this.compareFn(o1, o2);
      }
    },
    {
      name: 'toString',
      code: function() {
        return 'CUSTOM_COMPARE(' + this.compareFn.toString() + ')';
      }
    },
    {
      name: 'orderTail',
      code: function() { return undefined; },
      javaCode: 'return null;'
    },
    {
      /** TODO: allow user to set this to match the given function */
      name: 'orderPrimaryProperty',
      javaCode: 'return null;',
      code: function() { return undefined; }
    },
    {
      name: 'orderDirection',
      javaCode: 'return 1;',
      code: function() { return 1; }
    }
  ]
});


foam.LIB({
  name: 'foam.compare',

  methods: [
    function desc(c) {
      return foam.mlang.order.Desc.create({ arg1: c });
    },

    function toCompare(c) {
      return foam.Array.isInstance(c) ? foam.compare.compound(c) :
        foam.Function.isInstance(c)   ? foam.mlang.order.CustomComparator.create({ compareFn: c }) :
        c ;
    },

    // TODO: fix bug if combining ThenBy comparators
    function compound(args) {
      /* Create a compound comparator from an array of comparators. */
      var cs = args.map(foam.compare.toCompare);

      if ( cs.length === 0 ) return;
      if ( cs.length === 1 ) return cs[0];

      var ThenBy = foam.mlang.order.ThenBy;
      var ret, tail;

      ret = tail = ThenBy.create({head: cs[0], tail: cs[1]});

      for ( var i = 2 ; i < cs.length ; i++ ) {
        tail = tail.tail = ThenBy.create({head: tail.tail, tail: cs[i]});
      }

      return ret;
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'AbstractUnarySink',
  extends: 'foam.dao.AbstractSink',

  implements: [
    'foam.core.Serializable'
  ],

  documentation: 'An Abstract Sink baseclass which takes only one argument.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],

  methods: [
    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.arg1.toString() + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Max',
  extends: 'foam.mlang.sink.AbstractUnarySink',

  documentation: 'A Sink which remembers the maximum value put().',

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, sub) {
        if ( ! this.hasOwnProperty('value') || foam.util.compare(this.value, this.arg1.f(obj)) < 0 ) {
          this.value = this.arg1.f(obj);
        }
      },
      swiftCode: `
        let arg1 = self.arg1!
        if !hasOwnProperty("value") || FOAM_utils.compare(value, arg1.f(obj)) < 0 {
          value = arg1.f(obj);
        }
`,
      javaCode: 'if ( getValue() == null || ((Comparable)getArg1().f(obj)).compareTo(getValue()) > 0 ) {\n' +
      '      setValue(getArg1().f(obj));\n' +
      '    }'
    },
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Min',
  extends: 'foam.mlang.sink.AbstractUnarySink',

  documentation: 'A Sink which remembers the minimum value put().',

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, s) {
        if ( ! this.hasOwnProperty('value') || foam.util.compare(this.value, this.arg1.f(obj) ) > 0) {
          this.value = this.arg1.f(obj);
        }
      },
      javaCode: `if ( getValue() == null || ((Comparable)getArg1().f(obj)).compareTo(getValue()) < 0 ) {
  setValue(getArg1().f(obj));
}`
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Sum',
  extends: 'foam.mlang.sink.AbstractUnarySink',

  documentation: 'A Sink which sums put() values.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'Double',
      name: 'value',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) { this.value += this.arg1.f(obj); },
      javaCode: 'setValue(getValue() + ((Number) this.arg1_.f(obj)).doubleValue());'
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Average',
  extends: 'foam.mlang.sink.AbstractUnarySink',

  documentation: 'A Sink which averages put() values.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'Double',
      name: 'value',
      value: 0
    },
    {
      class: 'Long',
      name: 'count',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        this.count++;
        this.value = ( this.value + this.arg1.f(obj) ) / this.count;
      },
      javaCode: `
setCount(getCount() + 1);
setValue((getValue() + ((Number)this.getArg1().f(obj)).doubleValue()) / getCount());
      `,
    },
  ]
});


foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Dot',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: `
    A Binary Expression which evaluates arg1 and passes the result to arg2.
    In other word, the output of arg1 is the receiver of arg2.

    For example, to get city from user address:

    DOT(User.ADDRESS, Address.CITY).f(user); // return user.address.city
  `,

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(o) {
        return this.arg2.f(this.arg1.f(o));
      },
      javaCode: `
        Object receiver = getArg1().f(obj);
        if ( receiver == null ) return null;
        return getArg2().f(receiver);
      `
    },

    function comparePropertyValues(o1, o2) {
      /**
         Compare property values using arg2's property value comparator.
         Used by GroupBy
      **/
      return this.arg2.comparePropertyValues(o1, o2);
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'DotF',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: `A binary predicate that evaluates arg1 as a predicate with
    arg2 as its argument.`,

  javaImports: [
    'static foam.core.ContextAware.maybeContextualize'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        Object predicate = getArg1().f(obj);
        if ( predicate instanceof Predicate ) {
          maybeContextualize(getX(), predicate);
          return ((Predicate) predicate).f(getArg2().f(obj));
        }
        return false;
      `,
      code: function(o) {
        const predicate = this.arg1.f(o);
        if ( foam.mlang.predicate.Predicate.isInstance(predicate) ) {
          return predicate.f(this.arg2.f(o));
        }
        return false;
      }
    },
    {
      name: 'deepClone',
      type: 'FObject',
      javaCode: 'return this;'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'PredicatedExpr',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'An Expression that evaluates a predicate.',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'arg1'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return getArg1().f(obj);
      `
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'ContextObject',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'An Expression that returns object in the context using key.',

  properties: [
    {
      class: 'String',
      name: 'key'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(o) {
        return o[this.key];
      },
      javaCode: `
        return ((foam.core.X) obj).get(getKey());
      `
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'IsClassOf',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate which checks if the class of object is a specified class.',

  properties: [
    {
      class: 'Class',
      name: 'targetClass',
      view: {
        class: 'foam.u2.view.StrategizerChoiceView',
        desiredModelId: 'foam.Class'
      }
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(obj) {
        return this.targetClass.id == obj.cls_.id;
      },
      javaCode: `
        return getTargetClass().getObjClass() == obj.getClass();
      `
    },
    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.targetClass.id + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Expressions',

  documentation: 'Convenience mix-in for requiring all mlangs.',

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.expr.Add',
    'foam.mlang.expr.Divide',
    'foam.mlang.expr.Dot',
    'foam.mlang.expr.Ref',
    'foam.mlang.expr.MaxFunc',
    'foam.mlang.expr.MinFunc',
    'foam.mlang.expr.Multiply',
    'foam.mlang.expr.Subtract',
    'foam.mlang.order.Desc',
    'foam.mlang.order.ThenBy',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.DotF',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.Func',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Has',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Keyword',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.Neq',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.RegExp',
    'foam.mlang.predicate.IsClassOf',
    'foam.mlang.predicate.IsInstanceOf',
    'foam.mlang.predicate.StartsWith',
    'foam.mlang.predicate.StartsWithIC',
    'foam.mlang.predicate.EndsWith',
    'foam.mlang.predicate.True',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Explain',
    'foam.mlang.sink.GroupBy',
    'foam.mlang.sink.Map',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Projection',
    'foam.mlang.sink.Plot',
    'foam.mlang.sink.Sequence',
    'foam.mlang.sink.Sum',
    'foam.mlang.sink.Unique',
    'foam.mlang.Absolute',
    'foam.mlang.sink.Average',
    'foam.mlang.Mux',
    'foam.mlang.Partition'
  ],

  constants: [
    {
      name: 'FALSE',
      factory: function() { return foam.mlang.predicate.False.create() }
    },
    {
      name: 'TRUE',
      factory: function() { return foam.mlang.predicate.True.create() }
    }
  ],

  methods: [
    function _nary_(name, args) {
      return this[name].create({ args: Array.from(args) });
    },

    function _unary_(name, arg) {
      foam.assert(arg !== undefined, 'arg is required.');
      return this[name].create({ arg1: arg });
    },

    function _binary_(name, arg1, arg2) {
      foam.assert(arg1 !== undefined, 'arg1 is required.');
      foam.assert(arg2 !== undefined, 'arg2 is required.');
      return this[name].create({ arg1: arg1, arg2: arg2 });
    },

    function OR() { return this._nary_("Or", arguments); },
    function AND() { return this._nary_("And", arguments); },
    function CONTAINS(a, b) { return this._binary_("Contains", a, b); },
    function CONTAINS_IC(a, b) { return this._binary_("ContainsIC", a, b); },
    function EQ(a, b) { return this._binary_("Eq", a, b); },
    function NEQ(a, b) { return this._binary_("Neq", a, b); },
    function IN(a, b) { return this._binary_("In", a, b); },
    function LT(a, b) { return this._binary_("Lt", a, b); },
    function GT(a, b) { return this._binary_("Gt", a, b); },
    function LTE(a, b) { return this._binary_("Lte", a, b); },
    function GTE(a, b) { return this._binary_("Gte", a, b); },
    function HAS(a) { return this._unary_("Has", a); },
    function NOT(a) { return this._unary_("Not", a); },
    function KEYWORD(a) { return this._unary_("Keyword", a); },
    function STARTS_WITH(a, b) { return this._binary_("StartsWith", a, b); },
    function STARTS_WITH_IC(a, b) { return this._binary_("StartsWithIC", a, b); },
    function ENDS_WITH(a, b) { return this._binary_("EndsWith", a, b); },
    function FUNC(fn) { return this.Func.create({ fn: fn }); },
    function DOT(a, b) { return this._binary_("Dot", a, b); },
    function REF(a) { return this._unary_("Ref", a); },
    function DOT_F(a, b) { return this._binary_("DotF", a, b); },
    function ADD() { return this._nary_("Add", arguments); },
    function SUB() { return this._nary_("Subtract", arguments); },
    function MUL() { return this._nary_("Multiply", arguments); },
    function DIV() { return this._nary_("Divide", arguments); },
    function MIN_FUNC() { return this._nary_("MinFunc", arguments); },
    function MAX_FUNC() { return this._nary_("MaxFunc", arguments); },

    function UNIQUE(expr, sink) { return this.Unique.create({ expr: expr, delegate: sink }); },
    function GROUP_BY(expr, opt_sinkProto, opt_limit) { return this.GroupBy.create({ arg1: expr, arg2: opt_sinkProto || this.COUNT(), groupLimit: opt_limit || -1 }); },
    function PLOT() { return this._nary_('Plot', arguments); },
    function MAP(expr, sink) { return this.Map.create({ arg1: expr, delegate: sink }); },
    function EXPLAIN(sink) { return this.Explain.create({ delegate: sink }); },
    function COUNT() { return this.Count.create(); },
    function MAX(arg1) { return this.Max.create({ arg1: arg1 }); },
    function MIN(arg1) { return this.Min.create({ arg1: arg1 }); },
    function SUM(arg1) { return this.Sum.create({ arg1: arg1 }); },
    function AVG(arg1) { return this.Average.create({ arg1: arg1 }); },
    function ABS(arg1) { return this.Absolute.create({ delegate: arg1 }); },
    function MUX(cond, a, b) { return this.Mux.create({ cond: cond, a: a, b: b }); },
    function PARTITION_BY(arg1, delegate) { return this.Partition.create({ arg1: arg1, delegate: delegate }); },
    function SEQ() { return this._nary_("Sequence", arguments); },
    function PROJECTION(exprs) {
      return this.Projection.create({
        exprs: foam.Array.isInstance(exprs) ?
          exprs :
          foam.Array.clone(arguments)
        });
    },
    function REG_EXP(arg1, regExp) { return this.RegExp.create({ arg1: arg1, regExp: regExp }); },
    {
      name: 'DESC',
      args: [ { name: 'a', type: 'foam.mlang.order.Comparator' } ],
      type: 'foam.mlang.order.Comparator',
      code: function DESC(a) { return this._unary_("Desc", a); },
      swiftCode: `return Desc_create(["arg1": a])`,
    },
    function THEN_BY(a, b) { return this.ThenBy.create({head: a, tail: b}); },

    function INSTANCE_OF(cls) { return this.IsInstanceOf.create({ targetClass: cls }); },
    function CLASS_OF(cls) { return this.IsClassOf.create({ targetClass: cls }); }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'ExpressionsSingleton',
  extends: 'foam.mlang.Expressions',

  documentation: 'A convenience object which provides access to all mlangs.',
  // TODO: why is this needed? Why not just make Expressions a Singleton?

  axioms: [
    foam.pattern.Singleton.create()
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'RegExp',
  extends: 'foam.mlang.predicate.Unary',
  implements: [ 'foam.core.Serializable' ],
  properties: [
    {
      name: 'arg1',
      gridColumns: 6
    },
    {
      type: 'Regex',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'regExp',
      gridColumns: 6
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(o) {
        var v1 = this.arg1.f(o);
        return v1.toString().match(this.regExp);
      },
      javaCode: `
        return getRegExp().matcher(getArg1().f(obj).toString()).matches();
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'OlderThan',
  extends: 'foam.mlang.predicate.Unary',
  implements: [ 'foam.core.Serializable' ],
  properties: [
    {
      class: 'Long',
      name: 'timeMs'
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(o) {
        var v1 = this.arg1.f(o);
        return v1 && Date.now() - v1.getTime() > this.timeMs;
      },
      javaCode: `
        Object v1 = getArg1().f(obj);
        if ( v1 instanceof java.util.Date ) {
          return new java.util.Date().getTime() - ((java.util.Date)v1).getTime() > getTimeMs();
        }
        return false;
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'CurrentTime',
  extends: 'foam.mlang.AbstractExpr',
  axioms: [
    // TODO (michal): remove singleton if all calls to foam.mlang.CurrentTime.create() returns the same instance.
    { class: 'foam.pattern.Singleton' }
  ],
  methods: [
    {
      name: 'f',
      code: function(_) {
        return new Date();
      },
      javaCode: `
        return new java.util.Date();
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'StringLength',
  extends: 'foam.mlang.AbstractExpr',
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(o) { return this.arg1.f(o).length; },
      javaCode: 'return ((String) getArg1().f(obj)).length();'
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'IdentityExpr',
  extends: 'foam.mlang.AbstractExpr',
  axioms: [
    { class: 'foam.pattern.Singleton' }
  ],
  methods: [
    {
      name: 'f',
      code: function(o) { return o; },
      javaCode: 'return obj;'
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'IsValid',
  extends: 'foam.mlang.AbstractExpr',
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(o) {
        return this.arg1.f(o).errors_ ? false : true;
      },
      javaCode: `
try {
  ((foam.core.FObject) getArg1().f(obj)).validate(getX());
} catch(Exception e) {
  return false;
}
return true;
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'isAuthorizedToRead',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Expression which returns true if the user has a given permission.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.auth.AuthorizationException'
  ],

  properties: [
    {
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      javaType: 'foam.core.X',
      flags: ['java'],
      name: 'userContext'
    },
    {
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      javaType: 'foam.nanos.auth.Authorizer',
      flags: ['java'],
      name: 'authorizer'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function() {
        // Authorization on the client is futile since the user has full control
        // over the code that executes on their machine.
        // A client-side implementation of this predicate would also have to be
        // async in this case because we would need to access the auth service,
        // but we don't support async predicate execution on the client as far
        // as I'm aware.
        return true;
      },
      javaCode: `
        X x = (X) getUserContext();
        foam.nanos.auth.Authorizer authorizer = getAuthorizer();
        try {
          authorizer.authorizeOnRead(x, (FObject) obj);
        } catch ( AuthorizationException e ) {
          return false;
        }
        return true;
      `
    },
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'isAuthorizedToDelete',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Expression which returns true if the user has a given permission.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.auth.AuthorizationException'
  ],

  properties: [
    {
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      javaType: 'foam.core.X',
      flags: ['java'],
      name: 'userContext'
    },
    {
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      javaType: 'foam.nanos.auth.Authorizer',
      flags: ['java'],
      name: 'authorizer'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function() {
        // Authorization on the client is futile since the user has full control
        // over the code that executes on their machine.
        // A client-side implementation of this predicate would also have to be
        // async in this case because we would need to access the auth service,
        // but we don't support async predicate execution on the client as far
        // as I'm aware.
        return true;
      },
      javaCode: `
        X x = (X) getUserContext();
        foam.nanos.auth.Authorizer authorizer = getAuthorizer();
        try {
          authorizer.authorizeOnDelete(x, (FObject) obj);
        } catch ( AuthorizationException e ) {
          return false;
        }
        return true;
      `
    },
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'Formula',
  extends: 'foam.mlang.AbstractExpr',
  abstract: true,

  documentation: 'Formula base-class',

  properties: [
    {
      class: 'foam.mlang.ExprArrayProperty',
      name: 'args'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        Double result = null;
        for ( int i = 0; i < getArgs().length; i++) {
          var current = getArgs()[i].f(obj);
          if ( current instanceof Number ) {
            var oldResult = result;
            var value = ((Number) current).doubleValue();
            result = result == null ? value : reduce(result, value);

            if ( ! Double.isFinite(result) ) {
              var formula = getClass().getSimpleName() + "(" + oldResult + ", " + value + ")";
              throw new RuntimeException("Failed to evaluate formula:" +
                formula + ", result:" + result);
            }
          }
        }
        return result;
      `,
      code: function(o) {
        var result = null;
        for ( var i = 0; i < this.args.length; i++ ) {
          var current = this.args[i].f(o);
          if ( typeof current === 'number' ) {
            var oldResult = result;
            result = result === null ? current : this.reduce(result, current);

            if ( ! isFinite(result) ) {
              var formula = this.cls_.name + '(' + oldResult + ', ' + current + ')';
              throw new Error('Failed to evaluate formula:' + formula + ', result: ' + result);
            }
          }
        }
        return result;
      }
    },
    {
      name: 'reduce',
      type: 'Double',
      abstract: true,
      args: [
        { name: 'accumulator', type: 'Double' },
        { name: 'currentValue', type: 'Double' }
      ]
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(getClass().getSimpleName()).append('(');
        for ( int i = 0; i < getArgs().length; i++ ) {
          if ( i > 0 ) sb.append(", ");
          sb.append(getArgs()[i].toString());
        }
        sb.append(')');
        return sb.toString();
      `,
      code: function() {
        return this.cls_.name + '(' + this.args.map(a => a.toString()) + ')';
      }
    }
  ]
})

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Add',
  extends: 'foam.mlang.Formula',
  implements: [ 'foam.core.Serializable' ],

  methods: [
    {
      name: 'reduce',
      abstract: false,
      javaCode: 'return accumulator + currentValue;',
      code: (accumulator, currentValue) => accumulator + currentValue
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Subtract',
  extends: 'foam.mlang.Formula',
  implements: [ 'foam.core.Serializable' ],

  methods: [
    {
      name: 'reduce',
      abstract: false,
      javaCode: 'return accumulator - currentValue;',
      code: (accumulator, currentValue) => accumulator - currentValue
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Multiply',
  extends: 'foam.mlang.Formula',
  implements: [ 'foam.core.Serializable' ],

  methods: [
    {
      name: 'reduce',
      abstract: false,
      javaCode: 'return accumulator * currentValue;',
      code: (accumulator, currentValue) => accumulator * currentValue
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Divide',
  extends: 'foam.mlang.Formula',
  implements: [ 'foam.core.Serializable' ],

  methods: [
    {
      name: 'reduce',
      abstract: false,
      javaCode: 'return accumulator / currentValue;',
      code: (accumulator, currentValue) => accumulator / currentValue
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'MinFunc',
  extends: 'foam.mlang.Formula',
  implements: [ 'foam.core.Serializable' ],

  methods: [
    {
      name: 'reduce',
      abstract: false,
      javaCode: 'return accumulator <= currentValue ? accumulator : currentValue;',
      code: (accumulator, currentValue) => Math.min(accumulator, currentValue)
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'MaxFunc',
  extends: 'foam.mlang.Formula',
  implements: [ 'foam.core.Serializable' ],

  methods: [
    {
      name: 'reduce',
      abstract: false,
      javaCode: 'return accumulator >= currentValue ? accumulator : currentValue;',
      code: (accumulator, currentValue) => Math.max(accumulator, currentValue)
    }
  ]
});

// TODO(braden): We removed Expr.pipe(). That may still be useful to bring back,
// probably with a different name. It doesn't mean the same as DAO.pipe().
// remove eof()
