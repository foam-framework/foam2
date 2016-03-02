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

/**
 @module foam/mlang
 */
{ /* for docs only */ }


foam.CLASS({
  package: 'foam.mlang',
  implements: ['foam.dao.Sink'],
  name: 'CountExpr',
  properties: [
    {
      name: 'value',
      defaultValue: 0
    }
  ],
  methods: [
    function put() {
      this.value++;
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'ExprArray',
  extends: 'Array',
  properties: [
    {
      name: 'adaptArrayElement',
      defaultValue: function(o) {
        if ( typeof o !== "object" ) return foam.mlang.ConstantExpr.create({ value: o });
        if ( Array.isArray(o) ) return foam.mlang.ConstantExpr.create({ value: o });
        if ( o === true ) return foam.mlang.TrueExpr.create();
        if ( o === false ) return foam.mlang.FalseExpr.create();
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
        if ( typeof o !== "object" ) return foam.mlang.ConstantExpr.create({ value: o });
        return o;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Expr'
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'TrueExpr',
  implements: ['foam.mlang.Expr'],
  axioms: [ 'foam.patterns.Singleton' ],
  methods: [
    function f() { return true; }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'FalseExpr',
  implements: ['foam.mlang.Expr'],
  axioms: [ 'foam.patterns.Singleton' ],
  methods: [
    function f() { return false; }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'BINARY',
  implements: ['foam.mlang.Expr'],
  properties: [
    {
      name: 'arg1',
      class: 'foam.mlang.ExprArgument',
    },
    {
      name: 'arg2',
      class: 'foam.mlang.ExprArgument',
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'NARY',
  properties: [
    {
      class: 'foam.mlang.ExprArray',
      name: 'args'
    },
    {
      class: 'foam.mlang.ExprArgument',
      name: 'arg1'
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'OrExpr',
  implements: ['foam.mlang.Expr'],
  properties: [
    {
      class: 'foam.mlang.ExprArray',
      name: 'args'
    },
  ],
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
  package: 'foam.mlang',
  name: 'ContainsExpr',
  extends: 'foam.mlang.BINARY',
  methods: [
    function f(o) {
      if ( this.arg1.f(o).indexOf(this.arg2.f(o)) != -1 ) return true;
      return false;
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'ConstantExpr',
  implements: ['foam.mlang.Expr'],
  properties: [
    {
      name: 'value'
    },
  ],
  methods: [
    function f() { return this.value; }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'AndExpr',
  implements: ['foam.mlang.Expr'],
  properties: [
    {
      class: 'foam.mlang.ExprArray',
      name: 'args'
    }
  ],
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
  package: 'foam.mlang',
  name: 'InExpr',
  extends: 'foam.mlang.BINARY',
  methods: [
    function f(o) {
      // TODO: This just looks like a reverse ContainsExpr
      if ( this.arg2.f(o).indexOf(this.arg1.f(o)) != -1 ) return true;
      return false;
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'EqExpr',
  extends: 'foam.mlang.BINARY',
  methods: [
    function f(o) {
      return foam.util.equals(this.arg1.f(o), this.arg2.f(o));
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'GtExpr',
  extends: 'foam.mlang.BINARY',
  methods: [
    function f(o) {
      return this.arg1.f(o) > this.arg2.f(o);
    }
  ]
});

foam.CLASS({
  package: 'foam.mlang',
  name: 'Expressions',
  requires: [
    'foam.mlang.CountExpr',
    'foam.mlang.ConstantExpr',
    'foam.mlang.ContainsExpr',
    'foam.mlang.OrExpr',
    'foam.mlang.AndExpr',
    'foam.mlang.InExpr',
    'foam.mlang.EqExpr',
    'foam.mlang.GtExpr'
  ],
  methods: [
    function _nary_(name, args) { return this[name].create({ args: foam.array.argsToArray(args) }); },
    function _binary_(name, arg1, arg2) { return this[name].create({ arg1: arg1, arg2: arg2 }); },
    function OR() { return this._nary_("OrExpr", arguments); },
    function AND() { return this._nary_("AndExpr", arguments); },
    function IN(a, b) { return this._binary_("InExpr", a, b); },
    function CONTAINS(a, b) { return this._binary_("ContainsExpr", a, b); },
    function EQ(a, b) { return this._binary_("EqExpr", a, b); },
    function GT(a, b) { return this._binary_("GtExpr", a, b); }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'With',
  methods: [
    {
      name: 'with',
      code: function(f) {
        var argNames = foam.fn.argsArray(f);
        var args = [];
        for ( var i = 0 ; i < argNames.length ; i++ ) {
          var a = this[argNames[i]];
          if ( typeof a === "function" ) a = a.bind(this);
          args.push(a);
        }
        return f.apply(this, args);
      }
    }
  ]
});
