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

/**
 * Refine mLang predicates with toSQL() support.
 *
 * TODO/REVIEW
 *  The use of SUPER for validation, and validation in general, is concerning
 *  as it causes excessive SQL generation as well as redundent checks for
 *  the existance of arg1, arg2...

 *  An alternative solution is to refine toSQL() on all things that can be
 *  in an expression (Properties and all mlangs) then we can reliably call
 *  toSQL() on all arguments.
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'SQLException',
  extends: 'foam.core.Exception'
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'SQLSupport',

  //
  // NOTE: use as Singleton rather than implements to avoid
  // implements complications with Java
  //
  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function values(arg1, arg2) {
      return {
        v1: arg1.toSQL && arg1.toSQL(arg2) || arg1.toString(),
        v2: arg2 && ( arg2.toSQL && arg2.toSQL(arg1) || arg2.toString() ) || null
      };
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.Constant',
  methods: [
    function toSQL() {
      if ( isNaN(this.value) ) {
        var v = this.value.toString().toLowerCase();
        if (v === 'true' || v === 'yes') return 1;
        if (v === 'false' || v === 'no') return 0;
        return this.value.toString();
      }

      if ( this.value === true ) return 1;

      if ( this.value === false ) return 0;

      return this.value;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.True',
  methods: [
    function toSQL() { return '( 1 = 1 )'; }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.False',
  methods: [
    function toSQL() { return '( 1 <> 1 )'; }
  ]
});


/**
   The base models Unary and Binary are used to validate the arguments
   and throw a SQLException when invalid.
   Each child model shall call SUPER() to validate.
 */
foam.CLASS({
  refines: 'foam.mlang.predicate.Unary',
  requires: [ 'foam.dao.SQLException' ],
  methods: [
    function toSQL() {
      var v1 = this.arg1.toSQL ? this.arg1.toSQL() :
          this.arg1.toString ? this.arg1.toString() :
          this.arg1;

      if ( v1 === undefined || v1 === null )
        throw this.SQLException.create({message: this.cls_.name + '.arg1 is ' + v1});

      return v1;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Binary',
  requires: [ 'foam.dao.SQLException' ],
  methods: [
    function toSQL() {
      var v1 = this.arg1.toSQL ? this.arg1.toSQL() :
          this.arg1.toString ? this.arg1.toString() :
          this.arg1;

      if ( v1 === undefined || v1 === null )
        throw this.SQLException.create({message: this.cls_.name + '.arg1 is ' + v1});

      return v1;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Has',
  requires: [ 'foam.mlang.predicate.SQLSupport' ],
  methods: [
    function toSQL() {
      this.SUPER();
      var values = this.SQLSupport.create().values(this.arg1, this.arg2);

      return values().v1 + ' IS NOT NULL';
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Not',
  methods: [
    function toSQL() { return 'NOT ('+ this.arg1.toSQL()+')'; }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Eq',
  requires: [ 'foam.mlang.predicate.SQLSupport' ],
  methods: [
    function toSQL() {
      this.SUPER();

      var values = this.SQLSupport.create().values(this.arg1, this.arg2);

      return values.v2 === null ?
          values.v1 + ' IS NULL' :
          values.v1 + " = " + values.v2 ;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Neq',
  requires: [ 'foam.mlang.predicate.SQLSupport' ],
  methods: [
    function toSQL() {
      this.SUPER();

      var values = this.SQLSupport.create().values(this.arg1, this.arg2);

      return values.v2 === null ?
          values.v1 + ' IS NOT NULL' :
          values.v1 + " <> " + values.v2 ;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gt',
  requires: [
    'foam.mlang.predicate.SQLSupport',
    'foam.dao.SQLException'
  ],
  methods: [
    function toSQL() {
      this.SUPER();
      var values = this.SQLSupport.create().values(this.arg1, this.arg2);

      if ( values.v2 === null )
        throw this.SQLException.create({message: this.cls_.name+'.arg2 is '+values.v2});

      return values.v1 + ' > ' + values.v2;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Gte',
  requires: [
    'foam.mlang.predicate.SQLSupport',
    'foam.dao.SQLException'
  ],
  methods: [
    function toSQL() {
      this.SUPER();
      var values = this.SQLSupport.create().values(this.arg1, this.arg2);

      if ( values.v2 === null )
          throw this.SQLException.create({message: this.cls_.name + '.arg2 is ' + values.v2});

      return values.v1 + ' >= ' + values.v2;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lt',
  requires: [
    'foam.mlang.predicate.SQLSupport',
    'foam.dao.SQLException'
  ],
  methods: [
    function toSQL() {
      this.SUPER();
      var values = this.SQLSupport.create().values(this.arg1, this.arg2);

      if ( values.v2 === null )
        throw this.SQLException.create({message: this.cls_.name + '.arg2 is ' + values.v2});

      return values.v1 + ' < ' + values.v2;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Lte',
  requires: [
    'foam.mlang.predicate.SQLSupport',
    'foam.dao.SQLException'
  ],
  methods: [
    function toSQL() {
      this.SUPER();
      var values = this.SQLSupport.create().values(this.arg1, this.arg2);

      if (values.v2 === null )
        throw this.SQLException.create({message: this.cls_.name + '.arg2 is ' + values.v2});

      return values.v1 + ' <= ' + values.v2;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.And',
  methods: [
    // AND has a higher precedence than OR so doesn't need paranthesis
    function toSQL() {
      var s = '';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length - 1 )
        s += ' AND ';
      }
      return s;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Or',
  methods: [
    function toSQL() {
      var s = ' ( ';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length - 1 )
        s += ' OR ';
      }
      s += ' ) ';
      return s;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.In',
  requires: [ 'foam.mlang.predicate.SQLSupport' ],
  methods: [
    function toSQL() {
      this.SUPER();
      var values = this.SQLSupport.create().values(this.arg1, this.arg2).v1;
      var s = values.v1;
      s += ' IN ( \'';
      if ( Array.isArray(this.arg2) ) {
        s += this.arg2.join('\', \'');
      } else {
        s += values.v2;
      }
      s += '\')';
      return s;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Date',
  methods: [
    function toSQL() {
      var v1 = this.value || 0;
      return new Date(v1).toISOString();
    }
  ]
});
