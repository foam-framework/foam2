/*
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
  implements: ['foam.dao.Sink'],
  name: 'Count',
  properties: [
    {
      name: 'value',
      defaultValue: 0
    }
  ],
  methods: [
    function put() {
      this.value++;
    },
    function toString() {
      return 'COUNT()';
    },
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'ExprArray',
  extends: 'Array',
  properties: [
    {
      name: 'of',
      defaultValue: 'foam.mlang.predicate.Expr'
    },
    {
      name: 'adaptArrayElement',
      defaultValue: function(o) {
        if ( typeof o !== "object" ) return foam.mlang.predicate.Constant.create({ value: o });
        if ( Array.isArray(o) ) return foam.mlang.predicate.Constant.create({ value: o });
        if ( o === true ) return foam.mlang.predicate.True.create();
        if ( o === false ) return foam.mlang.predicate.False.create();
        return o;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'ExprArgument',
  extends: 'Property',
  properties: [
    {
      name: 'adapt',
      defaultValue: function(_, o) {
        if ( typeof o !== "object" ) return foam.mlang.predicate.Constant.create({ value: o });
        if ( o instanceof Date ) return foam.mlang.predicate.Constant.create({ value: o });
        return o;
      }
    }
  ]
});


/**
 * Base class for all mLang queries.
 *
 * Contains many default implementations of methods.
 */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Expr',
  abstract: true,

  methods: [
    /**
     * Abstract projection or evaluation method. Given an object, returns the
     * value of this expression for it. That might mean extracting a specific
     * property from the argument object, or evaluating some predicate like
     * equality on the expressions two arguments.
     */
    {
      name: 'f',
      args: [
        {
          name: 'obj',
        },
      ],
    },
    /** Converts this expression to a human-readable string for debugging. */
    function toString() {
      return this.cls_.name;
    },
    /**
     * Simplifies an expression by eliminating unnecessary clauses, and
     * combining others. Can sometimes reduce whole (sub)expressions to TRUE or
     * FALSE.
     */
    function partialEval() {
      return this;
    },
  ]
});

/** Singleton for the value "true". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'True',
  extends: 'foam.mlang.predicate.Expr',
  axioms: [ foam.pattern.Singleton.create() ],
  methods: [
    function f() { return true; },
    function toString() { return 'TRUE'; }
  ]
});

/** Singleton for the value "true". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'False',
  extends: 'foam.mlang.predicate.Expr',
  axioms: [ foam.pattern.Singleton.create() ],
  methods: [
    function f() { return false; },
    function toString() { return 'FALSE'; }
  ]
});

/** Base class for unary expressions. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Unary',
  extends: 'foam.mlang.predicate.Expr',
  abstract: true,

  properties: [
    {
      /** The first argument to the expression. */
      name: 'arg1',
      class: 'foam.mlang.ExprArgument',
    }
  ],

  methods: [
    function toString() {
      return foam.string.constantize(this.cls_.name) + '(' + this.arg1.toString() + ')';
    },
  ]
});


/** Base class for binary expressions. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Binary',
  extends: 'foam.mlang.predicate.Expr',
  abstract: true,
  properties: [
    {
      class: 'foam.mlang.ExprArgument',
      name: 'arg1',
    },
    {
      class: 'foam.mlang.ExprArgument',
      name: 'arg2',
    }
  ],

  methods: [
    function toString() {
      return foam.string.constantize(this.cls_.name) + '(' + this.arg1.toString() + ', ' +
          this.arg2.toString() + ')';
    },
  ]
});

/** Base class for n-ary expressions, those with 0 or more arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Nary',
  extends: 'foam.mlang.predicate.Expr',
  abstract: true,

  properties: [
    {
      class: 'foam.mlang.ExprArray',
      name: 'args'
    },
  ],

  methods: [
    function toString() {
      var s = foam.string.constantize(this.cls_.name) + '(';
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
  methods: [
    function f(o) {
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        if ( this.args[i].f(o) ) return true;
      }
      return false;
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'And',
  extends: 'foam.mlang.predicate.Nary',
  methods: [
    function f(o) {
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        if ( ! this.args[i].f(o) ) return false;
      }
      return true;
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Contains',
  extends: 'foam.mlang.predicate.Binary',
  methods: [
    function f(o) {
      var s1 = this.arg1.f(o);
      return s1 ? s1.indexOf(this.arg2.f(o)) !== -1 : false;
    },
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
  name: 'In',
  extends: 'foam.mlang.predicate.Binary',
  properties: [
    {
      name: 'arg2',
      postSet: function() {
        this.valueSet_ = null;
      }
    },
    {
      name: 'valueSet_',
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
            set[this.arg2[i]] = true;
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
  name: 'Constant',
  extends: 'foam.mlang.predicate.Expr',
  properties: [
    {
      name: 'value'
    },
  ],
  methods: [
    function f(_) { return this.value; },
    function toString_(x) {
      return typeof x === 'number' ? '' + x :
          typeof x === 'string' ? '"' + x + '"' :
          Array.isArray(x) ? '[' + x.map(this.toString_.bind(this)).join(', ') + ']' :
          x.toString ? x.toString() :
          x;
    },
    function toString() {
      return this.toString_(this.value);
    }
  ]
});


/** Binary expression for equality of two arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Eq',
  extends: 'foam.mlang.predicate.Binary',
  methods: [
    function f(o) {
      return foam.util.equals(this.arg1.f(o), this.arg2.f(o));
    }
  ]
});

/** Binary expression for inequality of two arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Neq',
  extends: 'foam.mlang.predicate.Binary',
  methods: [
    function f(o) {
      return ! foam.util.equals(this.arg1.f(o), this.arg2.f(o));
    }
  ]
});

/** Binary expression for "strictly less than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lt',
  extends: 'foam.mlang.predicate.Binary',
  methods: [
    function f(o) {
      return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) < 0;
    }
  ]
});

/** Binary expression for "less than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lte',
  extends: 'foam.mlang.predicate.Binary',
  methods: [
    function f(o) {
      return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) <= 0;
    }
  ]
});

/** Binary expression for "strictly greater than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gt',
  extends: 'foam.mlang.predicate.Binary',
  methods: [
    function f(o) {
      return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) > 0;
    }
  ]
});

/** Binary expression for "greater than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gte',
  extends: 'foam.mlang.predicate.Binary',
  methods: [
    function f(o) {
      return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) >= 0;
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
  extends: 'foam.mlang.predicate.Unary',

  methods: [
    function f(obj) {
      return ! this.arg1.f(obj);
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Expressions',
  requires: [
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Constant',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Has',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.Neq',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.mlang.sink.Count',
  ],
  methods: [
    function _nary_(name, args) {
      return this[name].create({ args: foam.array.argsToArray(args) });
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
  ]
});

// TODO(braden): We removed Expr.pipe(). That may still be useful to bring back,
// probably with a different name. It doesn't mean the same as DAO.pipe().
