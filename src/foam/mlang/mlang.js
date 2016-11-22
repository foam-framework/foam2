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

// TODO(braden): Port the partialEval() code over here.

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Count',
  extends: 'foam.dao.AbstractSink',

  properties: [
    {
      class: 'Int',
      name: 'value',
      value: 0
    }
  ],

  methods: [
    function put() {
      this.value++;
    },

    function toString() {
      return 'COUNT()';
    }
  ]
});

foam.INTERFACE({
  package: 'foam.mlang',
  name: 'Expr',
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
  package: 'foam.mlang',
  name: 'ExprProperty',
  extends: 'FObjectProperty',

  properties: [
    ['javaType', 'foam.mlang.Expr'],
    ['javaJSONParser', 'foam.lib.json.ExprParser'],
    {
      name: 'adapt',
      value: function(_, o) {
        if ( o === null ) return foam.mlang.Constant.create({ value: null });
        if ( ! o.f && typeof o === 'function' ) return foam.mlang.predicate.Func.create({ fn: o });
        if ( typeof o !== 'object' ) return foam.mlang.Constant.create({ value: o });
        if ( o instanceof Date ) return foam.mlang.Constant.create({ value: o });
        if ( foam.core.FObject.isInstance(o) || Array.isArray(o) ) return o;
        console.error('Invalid expression value: ', o);
      }
    },
    {
      name: 'fromJSON',
      value: function(value, opt_ctx) {
        // TODO: create a NamedProperty which doesn't include class, if possible
        return value && '__Property__' === value.class ?
            foam.lookup(value.source).getAxiomByName(value.name) :
            foam.json.parse(value, null, opt_ctx) ;
      }
    },
    {
      name: 'toJSON',
      value: function(value) {
        return foam.core.Property.isInstance(value) ?
            { class: '__Property__', source: value.sourceCls_.id, name: value.name } :
            value ;
      }
    }
  ]
});


foam.INTERFACE({
  package: 'foam.mlang.predicate',
  name: 'Predicate',
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
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'PredicateProperty',
  extends: 'FObjectProperty',
  properties: [
    ['javaType', 'foam.mlang.predicate.Predicate'],
    ['of', 'foam.mlang.predicate.Predicate'],
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

  properties: [
    [ 'javaType', 'foam.mlang.predicate.Predicate[]' ],
    {
      name: 'of',
      value: 'foam.mlang.predicate.Predicate'
    },
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
  implements: ['foam.mlang.predicate.Predicate'],
  methods: [
    {
      name: 'partialEval',
      javaCode: 'return this;',
      // Return this javaReturns when it is inherited properly. (Traits are fixed).
      javaReturns: 'foam.mlang.predicate.Predicate',
      code: function() {
        return this;
      }
    },
    {
      name: 'toString',
      javaCode: 'return classInfo_.getId();',
      code: function() {
        return this.cls_.name;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'AbstractExpr',
  abstract: true,
  implements: ['foam.mlang.Expr'],
  methods: [
    {
      name: 'partialEval',
      javaCode: 'return this;',
      // Return this javaReturns when it is inherited properly. (Traits are fixed).
      javaReturns: 'foam.mlang.Expr',
      code: function() {
        return this;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'True',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    {
      name: 'f',
      code: function() { return true; },
      javaCode: 'return true;'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'False',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    {
      name: 'f',
      javaCode: 'return false;',
      code: function() { return false; }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Unary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

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


/** Base class for binary expressions. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Binary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

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
    function toString() {
      return foam.String.constantize(this.cls_.name) + '(' +
          this.arg1.toString() + ', ' +
          this.arg2.toString() + ')';
    }
  ]
});


/** Base class for n-ary expressions, those with 0 or more arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Nary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

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
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Or',
  extends: 'foam.mlang.predicate.Nary',

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
      javaCode: 'for ( int i = 0 ; i < getArgs().length ; i++ ) {\n'
                + '  if ( getArgs()[i].f(obj) ) return true;\n'
                + '}\n'
                + 'return false;\n'
    },
    function partialEval() {
      var newArgs = [];
      var updated = false;

      var TRUE = this.True.create();
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

      /*
      TODO(braden): Implement partialOr and PARTIAL_OR_RULES, for full partial
      eval support. Currently this is only dropping FALSE, and short-circuiting
      on TRUE.

      for ( var i = 0 ; i < newArgs.length-1 ; i++ ) {
        for ( var j = i+1 ; j < newArgs.length ; j++ ) {
          var a = this.partialOr(newArgs[i], newArgs[j]);
          if ( a ) {
            if ( a === TRUE ) return TRUE;
            newArgs[i] = a;
            newArgs.splice(j, 1);
          }
        }
      }
      */

      if ( newArgs.length === 0 ) return FALSE;
      if ( newArgs.length === 1 ) return newArgs[0];

      return updated ? this.cls_.create({ args: newArgs }) : this;
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'And',
  extends: 'foam.mlang.predicate.Nary',

  methods: [
    {
      name: 'f',
      code: function(o) {
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          if ( ! this.args[i].f(o) ) return false;
        }
        return true;
      },
      javaCode: 'for ( int i = 0 ; i < getArgs().length ; i++ ) {\n'
                + '  if ( ! getArgs()[i].f(obj) ) return false;\n'
                + '}\n'
                + 'return true;'
    },
    function partialEval() {
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

      /*
      TODO(braden): Implement partialAnd and PARTIAL_AND_RULES, for full partial
      eval support. Currently it just drops TRUE and bails on FALSE.

      for ( var i = 0; i < newArgs.length - 1; i++ ) {
        for ( var j = i + 1; j < newArgs.length; j++ ) {
          var a = this.partialAnd(newArgs[i], newArgs[j]);
          if ( a ) {
            if ( a === FALSE ) return FALSE;
            newArgs[i] = a;
            newArgs.splice(j, 1);
          }
        }
      }
      */

      if ( newArgs.length === 0 ) return TRUE;
      if ( newArgs.length === 1 ) return newArgs[0];

      return updated ? this.cls_.create({ args: newArgs }) : this;
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Contains',
  extends: 'foam.mlang.predicate.Binary',

  methods: [
    {
      name: 'f',
      javaCode: 'String s1 = (String)getArg1().f(obj);\n'
                + 'String s2 = (String)getArg2().f(obj);\n'
                + 'return s1 != null ? s1.indexOf(s2) != -1 : false;\n',
      code: function(o) {
        var s1 = this.arg1.f(o);
        return s1 ? s1.indexOf(this.arg2.f(o)) !== -1 : false;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'ContainsIC',
  extends: 'foam.mlang.predicate.Binary',

  methods: [
    function f(o) {
      var s1 = this.arg1.f(o);
      var s2 = this.arg2.f(o);
      if ( typeof s1 !== 'string' || typeof s2 !== 'string' ) return false;
      // TODO(braden): This is faster if we use a regex with the ignore-case
      // option. That requires regex escaping arg2, though.
      var uc1 = s1.toUpperCase();
      var uc2 = s2.toUpperCase();
      return uc1.indexOf(uc2) !== -1;
    },
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'StartsWith',
  extends: 'foam.mlang.predicate.Binary',

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
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'StartsWithIC',
  extends: 'foam.mlang.predicate.Binary',

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
  package: 'foam.mlang.predicate',
  name: 'In',
  extends: 'foam.mlang.predicate.Binary',

  properties: [
    {
      name: 'arg1',
      postSet: function(old, nu) {
        // this is slightly slower when an expression on upperCase_
        this.upperCase_ = nu && foam.core.Enum.isInstance(nu);
      }
    },
    {
      name: 'arg2',
      postSet: function() {
        this.valueSet_ = null;
      }
    },
    {
      name: 'valueSet_'
    },
    {
      name: 'upperCase_',
    }
  ],

  methods: [
    function f(o) {
      var lhs = this.arg1.f(o);

      // If arg2 is a constant array, we use valueSet for it.
      if ( Array.isArray(this.arg2) ) {
        if ( ! this.valueSet_ ) {
          var set = {};
          for ( var i = 0 ; i < this.arg2.length ; i++ ) {
            var s = this.arg2[i];
            if ( this.upperCase_ ) s = s.toUpperCase();
            set[s] = true;
          }
          this.valueSet_ = set;
        }

        return !! this.valueSet_[lhs];
      } else {
        var rhs = this.arg2.f(o);
        if ( ! rhs ) return false;
        return rhs.indexOf(lhs) !== -1;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'InIC',
  extends: 'foam.mlang.predicate.Binary',

  properties: [
    {
      name: 'arg2',
      postSet: function() {
        this.valueSet_ = null;
      }
    },
    {
      name: 'valueSet_'
    }
  ],

  methods: [
    function f(o) {
      var lhs = this.arg1.f(o).toUpperCase();
      // If arg2 is a constant array, we use valueSet for it.
      if ( Array.isArray(this.arg2) ) {
        if ( ! this.valueSet_ ) {
          var set = {};
          for ( var i = 0 ; i < this.arg2.length ; i++ ) {
            set[this.arg2[i].toUpperCase()] = true;
          }
          this.valueSet_ = set;
        }

        return !! this.valueSet_[lhs];
      } else {
        var rhs = this.arg2.f(o);
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

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function() {
        return this.value;
      },
      javaCode: 'return getValue();'
    },
    function toString_(x) {
      return typeof x === 'number' ? '' + x :
        typeof x === 'string' ? '"' + x + '"' :
        Array.isArray(x) ? '[' + x.map(this.toString_.bind(this)).join(', ') + ']' :
        x.toString ? x.toString() :
        x;
    },
    function toString() {
      return this.toString_(this.value);
    },
    // TODO(adamvy): Re-enable when we can parse this in java more correctly.
    function xxoutputJSON(os) {
      os.output(this.value);
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Func',
  extends: 'foam.mlang.predicate.AbstractPredicate',

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

  methods: [
    {
      name: 'f',
      code: function(o) {
        var v1 = this.arg1.f(o);
        var v2 = this.arg2.f(o);

        // First check is so that EQ(Class.PROPERTY, null | undefined) works.
        return ( v1 === undefined && v2 === null ) || foam.util.equals(v1, v2);
      },
      // TODO(adamvy): Better optional than all the Comparable casts?
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) == 0;'
    }
  ]
});

/** Binary expression for inequality of two arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Neq',
  extends: 'foam.mlang.predicate.Binary',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return ! foam.util.equals(this.arg1.f(o), this.arg2.f(o));
      },
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) != 0;'
    }
  ]
});


/** Binary expression for "strictly less than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lt',
  extends: 'foam.mlang.predicate.Binary',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) < 0;
      },
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) < 0;'
    }
  ]
});


/** Binary expression for "less than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lte',
  extends: 'foam.mlang.predicate.Binary',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) <= 0;
      },
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) <= 0;'
    }
  ]
});


/** Binary expression for "strictly greater than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gt',
  extends: 'foam.mlang.predicate.Binary',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) > 0;
      },
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) > 0;'
    }
  ]
});


/** Binary expression for "greater than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gte',
  extends: 'foam.mlang.predicate.Binary',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) >= 0;
      },
      javaCode: 'return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) >= 0;'
    }
  ]
});


/** Unary expression that checks the given property is well-defined. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Has',
  extends: 'foam.mlang.predicate.Unary',

  methods: [
    function f(obj) {
      var value = this.arg1.f(obj);
      var notHas = value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0);
      return !notHas;
    }
  ]
});


/** Unary expression that expects a boolean value and inverts it. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Not',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'arg1'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(obj) {
        return ! this.arg1.f(obj);
      },
      javaCode: 'return ! getArg1().f(obj);'
    },
    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.arg1.toString() + ')';
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

/** Unary expression for a generic keyword search. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Keyword',
  extends: 'foam.mlang.predicate.Unary',
  requires: [
    'foam.core.String'
  ],
  methods: [
    function f(obj) {
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
    }
  ]
});


/** Map sink transforms each put with a given mapping expression. */
foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Map',
  extends: 'foam.dao.ProxySink',

  implements: [
    'foam.mlang.predicate.Unary'
  ],

  methods: [
    function f(o) {
      return this.arg1.f(o);
    },
    function put(o) {
      this.delegate.put( this.f(o) );
    },
  ]
});

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'GroupBy',
  extends: 'foam.dao.AbstractSink',

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
      name: 'groups',
      factory: function() { return {}; }
    },
    {
      class: 'StringArray',
      name: 'groupKeys',
      factory: function() { return []; }
    }
  ],

  methods: [
    function sortedKeys(opt_comparator) {
      this.groupKeys.sort(opt_comparator || this.arg1.comparePropertyValues);
      return this.groupKeys;
    },
    function putInGroup_(key, obj) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];
      if ( ! group ) {
        group = this.arg2.clone();
        this.groups[key] = group;
        this.groupKeys.push(key);
      }
      group.put(obj);
    },
    function put(obj) {
      var key = this.arg1.f(obj);
      if ( Array.isArray(key) ) {
        if ( key.length ) {
          for ( var i = 0; i < key.length; i++ ) {
            this.putInGroup_(key[i], obj);
          }
        } else {
          // Perhaps this should be a key value of null, not '', since '' might
          // actually be a valid key.
          this.putInGroup_('', obj);
        }
      } else {
        this.putInGroup_(key, obj);
      }
    },
    function eof() {
    },
    function clone() {
      // Don't use the default clone because we don't want to copy 'groups'.
      return this.cls_.create({ arg1: this.arg1, arg2: this.arg2 });
    },
    function toString() {
      return this.groups.toString();
    }
  ]
});


/** Pseudo-expression which outputs a human-readable description of its
  subexpression, and the plan for evaluating it. */
foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Explain',
  extends: 'foam.dao.ProxySink',

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


foam.INTERFACE({
  package: 'foam.mlang.order',
  name: 'Comparator',
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
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Property',
  implements: [ 'foam.mlang.order.Comparator' ]
});

foam.CLASS({
  package: 'foam.mlang.order',
  name: 'Desc',
  implements: [ 'foam.mlang.order.Comparator' ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'arg1',
      of: 'foam.mlang.order.Comparator',
      adapt: function(_, c) { return foam.compare.toCompare(c); }
    }
  ],

  methods: [
    {
      name: 'compare',
      code: function(o1, o2) {
        return -1 * this.arg1.compare(o1, o2);
      },
      javaCode: 'return -1 * getArg1().compare(o1, o2);'
    },
    {
      name: 'toString',
      code: function() {
        return 'DESC(' + this.arg1.toString() + ')';
      },
      javaCode: 'return "DESC(" + getArg1().toString() + ")";'
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.order',
  name: 'ThenBy',
  implements: ['foam.mlang.order.Comparator'],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      adapt: function(_, a) {
        return a;
      },
      name: 'arg1'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      adapt: function(_, a) {
        return a;
      },
      name: 'arg2'
    },
  ],

  methods: [
    {
      name: 'compare',
      code: function(o1, o2) {
        // an equals of arg1.compare is falsy, which will then hit arg2
        return this.arg1.compare(o1, o2) || this.arg2.compare(o1, o2);
      }
    },
    {
      name: 'toString',
      code: function() {
        return 'THEN_BY(' + this.arg1.toString() + ', ' +
          this.arg2.toString() + ')';
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.order',
  name: 'CustomComparator',
  implements: ['foam.mlang.order.Comparator'],

  properties: [
    {
      class: 'Function',
      name: 'compareFn'
    },
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
        return 'CUSTOM_COMPARE(' + this.arg1.toString() + ')';
      }
    }
  ]
});

foam.LIB({
  name: 'foam.compare',
  methods: [
    function desc(c) {
      return foam.mlang.order.Desc.create({ arg1: c });
    },

    function toCompare(c /*foam.mlang.order.Comparator*/) {
      var ret = foam.Array.isInstance(c) ? foam.compare.compound(c) :
        foam.Function.isInstance(c) ? foam.mlang.order.CustomComparator.create({ compareFn: c }) :
        c ;
      return ret;
    },

    function compound(/*array*/ args) {
      var cs = args.map(foam.compare.toCompare);

      if ( cs.length === 0 ) return;
      if ( cs.length === 1 ) return cs[0];

      var ret = foam.mlang.order.ThenBy.create({
        arg1: cs[cs.length - 1],
        arg2: cs[cs.length - 2]
      });
      for ( var i = cs.length - 3; i >= 0; i-- ) {
        ret = foam.mlang.order.ThenBy.create({ arg1: cs[i], arg2: ret });
      }
      return ret;
    }
  ]
});



foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Max',
  extends: 'foam.dao.AbstractSink',

  implements: [
    'foam.mlang.predicate.Unary'
  ],

  properties: [
    {
      name: 'value',
      value: 0
    }
  ],

  methods: [
    function put(obj) {
      if ( ! this.hasOwnProperty('value') ) {
        this.value = this.arg1.f(obj);
      } else if ( foam.util.compare(this.value, this.arg1.f(obj)) < 0 ) {
        this.value = this.arg1.f(obj);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Dot',
  extends: 'foam.mlang.predicate.Binary',
  methods: [
    function f(o) {
      return this.arg2.f(this.arg1.f(o));
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'Expressions',

  requires: [
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.StartsWith',
    'foam.mlang.predicate.StartsWithIC',
    'foam.mlang.predicate.Eq',
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
    'foam.mlang.predicate.Func',
    'foam.mlang.expr.Dot',
    'foam.mlang.Constant',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Map',
    'foam.mlang.sink.Explain',
    'foam.mlang.order.Desc'
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
    function STARTS_WITH(a, b) { return this._binary_("StartsWith", a); },
    function STARTS_WITH_IC(a, b) { return this._binary_("StartsWithIC", a, b); },
    function FUNC(fn) { return this.Func.create({ fn: fn }); },
    function DOT(a, b) { return this._binary_("Dot", a, b); },

    function MAP(expr, sink) { return this.Map.create({ arg1: expr, delegate: sink }); },
    function EXPLAIN(sink) { return this.Explain.create({ delegate: sink }); },
    function COUNT() { return this.Count.create(); },

    function DESC(c) { return this.Desc.create({ arg1: c }); },
    function MAX(arg1) { return this.Max.create({ arg1: arg1 }); },
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'ExpressionsSingleton',
  extends: 'foam.mlang.Expressions',
  axioms: [
    foam.pattern.Singleton.create()
  ]
});

// TODO(braden): We removed Expr.pipe(). That may still be useful to bring back,
// probably with a different name. It doesn't mean the same as DAO.pipe().
