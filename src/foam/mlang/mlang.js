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
      of: 'foam.dao.Sink',
      name: 'args'
    },
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.args.forEach(function(a) { a.put(obj, s); });
      }
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.args.forEach(function(a) { a.remove(obj, s); });
      }
    },
    {
      name: 'reset',
      code: function(s) {
        this.args.forEach(function(a) { a.reset(s); });
      }
    },
    function toString() {
      return 'SEQ(' + this.args.map(function(a) { return a.toString(); }).join(',') + ')';
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
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2'
    },
    {
      class: 'List',
      name: 'points',
      factory: function() { return [] },
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.points.push([this.arg1.f(obj), this.arg2.f(obj)]);
        // TODO: Array properties should provide convenience for this,
        // like this.point$.push() or something.
        this.pub('propertyChange', 'points', this.points$);
      },
      javaCode: `
        java.util.List point = new java.util.ArrayList();
        point.add(getArg1().f(obj));
        point.add(getArg2().f(obj));
        getPoints().add(point);
      `,
    },
    {
      name: 'remove',
      code: function(obj, s) {
        // TODO
      }
    },
    {
      name: 'reset',
      code: function(s) {
        this.points = [];
      }
    },
    function toString() {
      return 'PLOT(' + this.arg1.toString() + ',' + this.arg2.toString() + ')';
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
    ['javaJSONParser', 'new foam.lib.json.ExprParser()'],
    {
      name: 'view',
      value: { class: 'foam.u2.view.ExprView' }
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
      value: function(_, o, p) {
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
    ['javaJSONParser', 'new foam.lib.json.FObjectParser()'],
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
        if ( ! o.f && typeof o === "function" ) return foam.mlang.predicate.Func.create({ fn: o });
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
          javaType: 'foam.dao.pg.IndexedPreparedStatement'
        }
      ],
      javaCode: '//noop',
      swiftCode: '//noop'
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
          javaType: 'foam.dao.pg.IndexedPreparedStatement'
        }
      ],
      javaCode: ' '
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
      name: 'arg1'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2',
      adapt: function(old, nu, prop) {
        var value = prop.adaptValue(nu);
        var arg1 = this.arg1;
        if ( foam.mlang.Constant.isInstance(value) && arg1 && arg1.adapt )
          value.value = this.arg1.adapt.call(null, old, value.value, arg1);

        return value;
      }
    }
  ],

  methods: [
    function toIndex(tail) {
      return this.arg1 && this.arg1.toIndex(tail);
    },

    function toString() {
      return foam.String.constantize(this.cls_.name) + '(' +
          this.arg1.toString() + ', ' +
          this.arg2.toString() + ')';
    },
    {
      name: 'prepareStatement',
      javaCode: `getArg1().prepareStatement(stmt);
getArg2().prepareStatement(stmt);`
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
    function toString() {
      var s = foam.String.constantize(this.cls_.name) + '(';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toString();
        if ( i < this.args.length - 1 ) s += ', ';
      }
      return s + ')';
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
      javaCode:`for ( Predicate predicate : getArgs() ) {
  predicate.prepareStatement(stmt);
}`
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
True TRUE = new True();
False FALSE = new False();
for ( int i = 0; i < this.args_.length; i++ ) {
  Predicate arg = this.args_[i];
  Predicate newArg = this.args_[i].partialEval();
  if ( newArg instanceof True ) return TRUE;
  if ( newArg instanceof Or ) {
    for ( int j = 0; j < ( ( (Or) newArg ).args_.length ); j++ ) {
      args.add(( (Or) newArg ).args_[j]);
    }
    update = true;
  } else {
    if ( newArg instanceof False || arg == null ) {
      update = true;
    } else {
      args.add(newArg);
      if ( ! arg.createStatement().equals(newArg.createStatement()) ) update = true;
    }
  }
}
if ( args.size() == 0 ) return TRUE;
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
        var TRUE = foam.mlang.predicate.True.create();

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
True TRUE = new True();
False FALSE = new False();
for ( int i = 0; i < this.args_.length; i++ ) {
  Predicate arg = this.args_[i];
  Predicate newArg = this.args_[i].partialEval();
  if ( newArg instanceof False ) return FALSE;
  if ( newArg instanceof And ) {
    for ( int j = 0; j < ( ( (And) newArg ).args_.length ); j++ ) {
      args.add(( (And) newArg ).args_[j]);
    }
    update = true;
  } else {
    if ( newArg instanceof True || newArg == null ) {
      update = true;
    } else {
      args.add(newArg);
      if ( ! arg.createStatement().equals(newArg.createStatement()) ) update = true;
    }
  }
}
if ( args.size() == 0 ) return TRUE;
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
      name: 'valueSet_'
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
      type: 'String',
      javaCode: 'return " " + getArg1().createStatement() + " in " + getArg2().createStatement();'
    },

    function partialEval() {
      if ( ! this.Constant.isInstance(this.arg2) ) return this;

      return ( ! this.arg2.value ) || this.arg2.value.length === 0 ?
          this.FALSE : this;
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
        x.toString ? x.toString() :
        x;
    },

    function toString() { return this.toString_(this.value); },

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

    function toString_(x) {
      return Array.isArray(x) ? '[' + x.map(this.toString_.bind(this)).join(', ') + ']' :
        x.toString ? x.toString :
        x;
    },

    function toString() { return this.toString_(this.value); }
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
        return  ( v1 !== undefined ||
                  v2 !== null ) &&
          ! foam.util.equals(v1, v2);
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
      javaType: 'foam.core.ClassInfo'
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
    'java.util.Iterator',
    'java.util.List'
  ],

  documentation: 'Unary Predicate for generic keyword search (searching all String properties for argument substring).',

  requires: [
    {
      name: 'String',
      path: 'foam.core.String',
      flags: ['js'],
    },
  ],

  methods: [
    {
      name: 'f',
      code: function f(obj) {
        var arg = this.arg1.f(obj);
        if ( ! arg || typeof arg !== 'string' ) return false;

        arg = arg.toLowerCase();

        var props = obj.cls_.getAxiomsByClass(this.String);
        for ( var i = 0; i < props.length; i++ ) {
          var s = props[i].f(obj);
          if ( ! s || typeof s !== 'string' ) continue;
          if ( s.toLowerCase().indexOf(arg) >= 0 ) return true;
        }

        return false;
      },
      javaCode: `
if ( ! ( getArg1().f(obj) instanceof String) )
  return false;

String arg1 = ((String) getArg1().f(obj)).toUpperCase();
List props = ((foam.core.FObject)obj).getClassInfo().getAxiomsByClass(PropertyInfo.class);
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
    }
  ]
});


/** Map sink transforms each put with a given mapping expression. */
foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Map',
  extends: 'foam.dao.ProxySink',
  axioms: [
    {
      // TODO: Remove this when MAP works properly on java.  github issue #1020
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],

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
      return 'MAP(' + this.arg1.toString() + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Mul',

  extends: 'foam.mlang.predicate.Binary',

  implements: [
    'foam.core.Serializable'
  ],

  documentation: 'Multiplication Binary Expression.',

  methods: [
    function f(o) { return this.arg1.f(o) * this.arg2.f(o); }
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
      this.groups = undefined;
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
}`
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
        return this.groups.toString();
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
      javaJSONParser: 'new foam.lib.json.ExprParser()'
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
      name: 'tail'
    },
    {
      name: 'compare',
      swiftSupport: false,
      transient: true,
      documentation: 'Is a property so that it can be bound to "this" so that it works with Array.sort().',
      factory: function() { return this.compare_.bind(this); }
    }
  ],

  methods: [
    function compare_(o1, o2) {
      // an equals of arg1.compare is falsy, which will then hit arg2
      return this.head.compare(o1, o2) || this.tail.compare(o1, o2);
    },

    function toString() {
      return 'THEN_BY(' + this.head.toString() + ', ' +
        this.tail.toString() + ')';
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
        tail = tail.arg2 = ThenBy.create({arg1: tail.arg2, arg2: cs[i]});
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

  documentation: 'A Binary Predicate which applies arg2.f() to arg1.f().',

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
        return getArg2().f(getArg1().f(obj));
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
      javaCode: `
        return ((foam.core.X) obj).get(getKey());
      `
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Expressions',

  documentation: 'Convenience mix-in for requiring all mlangs.',

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.expr.Dot',
    'foam.mlang.expr.Mul',
    'foam.mlang.order.Desc',
    'foam.mlang.order.ThenBy',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
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
    'foam.mlang.predicate.IsInstanceOf',
    'foam.mlang.predicate.StartsWith',
    'foam.mlang.predicate.StartsWithIC',
    'foam.mlang.predicate.EndsWith',
    'foam.mlang.predicate.True',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Explain',
    'foam.mlang.sink.GroupBy',
    'foam.mlang.sink.Plot',
    'foam.mlang.sink.Map',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'foam.mlang.sink.Sum',
    'foam.mlang.sink.Unique'
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
      return this[name].create({ arg1: arg });
    },

    function _binary_(name, arg1, arg2) {
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
    function MUL(a, b) { return this._binary_("Mul", a, b); },

    function UNIQUE(expr, sink) { return this.Unique.create({ expr: expr, delegate: sink }); },
    function GROUP_BY(expr, sinkProto) { return this.GroupBy.create({ arg1: expr, arg2: sinkProto }); },
    function PLOT(x, y) { return this.Plot.create({ arg1: x, arg2: y }); },
    function MAP(expr, sink) { return this.Map.create({ arg1: expr, delegate: sink }); },
    function EXPLAIN(sink) { return this.Explain.create({ delegate: sink }); },
    function COUNT() { return this.Count.create(); },
    function MAX(arg1) { return this.Max.create({ arg1: arg1 }); },
    function MIN(arg1) { return this.Min.create({ arg1: arg1 }); },
    function SUM(arg1) { return this.Sum.create({ arg1: arg1 }); },
    function AVG(arg1) { return this.Average.create({ arg1: arg1 }); },
    function SEQ() { return this._nary_("Sequence", arguments); },

    {
      name: 'DESC',
      args: [ { name: 'a', type: 'foam.mlang.order.Comparator' } ],
      type: 'foam.mlang.order.Comparator',
      code: function DESC(a) { return this._unary_("Desc", a); },
      swiftCode: `return Desc_create(["arg1": a])`,
    },
    function THEN_BY(a, b) { return this.ThenBy.create({head: a, tail: b}); },

    function INSTANCE_OF(cls) { return this.IsInstanceOf.create({ targetClass: cls }); }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'ExpressionsSingleton',
  extends: 'foam.mlang.Expressions',

  documentation: 'A convenience object which provides access to all mlangs.',
  // TODO: why is this needed?

  axioms: [
    foam.pattern.Singleton.create()
  ]
});


// TODO(braden): We removed Expr.pipe(). That may still be useful to bring back,
// probably with a different name. It doesn't mean the same as DAO.pipe().
// remove eof()
