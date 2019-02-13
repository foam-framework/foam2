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

foam.CLASS({
  package: 'foam.dao',
  name: 'SQLException',
  extends: 'foam.core.Exception'
});


foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractPredicateSQLValueRefinement',
  refines: 'foam.mlang.predicate.AbstractPredicate',

  requires: [ 'foam.dao.SQLException' ],

  methods: [
    function sqlValue(argName) {
      var arg = this[argName];
      var v = arg && arg.toSQL ? arg.toSQL() :
        arg && arg.toString ? arg.toString() :
        arg;

      if ( v === undefined || v === null )
        throw this.SQLException.create({message: this.cls_.name + '.' + argName +': '+ v});

      return v;
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ConstantToSQLRefinement',
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
  package: 'foam.dao',
  name: 'TrueToSQLRefinement',
  refines: 'foam.mlang.predicate.True',
  methods: [
    function toSQL() { return '( 1 = 1 )'; }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'FalseToSQLRefinement',
  refines: 'foam.mlang.predicate.False',
  methods: [
    function toSQL() { return '( 1 <> 1 )'; }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'UnaryToSQLRefinement',
  refines: 'foam.mlang.predicate.Unary',
  methods: [
    function toSQL() {
      throw this.SQLException.create({message: this.cls_.name + '.toSQL() not implemented'});
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'BinaryToSQLRefinement',
  refines: 'foam.mlang.predicate.Binary',
  methods: [
    function toSQL() {
      throw this.SQLException.create({message: this.cls_.name + '.toSQL() not implemented'});
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'HasToSQLRefinement',
  refines: 'foam.mlang.predicate.Has',
  methods: [
    function toSQL() {
      return this.sqlValue('arg1') + ' IS NOT NULL';
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'NotToSQLRefinement',
  refines: 'foam.mlang.predicate.Not',
  methods: [
    function toSQL() { return 'NOT ('+ this.arg1.toSQL()+')'; }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'EqToSQLRefinement',
  refines: 'foam.mlang.predicate.Eq',
  methods: [
    function toSQL() {
      return this.arg2 === null ?
        this.sqlValue('arg1') + ' IS NULL' :
        this.sqlValue('arg1') + " = " + this.sqlValue('arg2');
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'NeqToSQLRefinement',
  refines: 'foam.mlang.predicate.Neq',
  methods: [
    function toSQL() {
      return this.arg2 === null ?
        this.sqlValue('arg1') + ' IS NOT NULL' :
        this.sqlValue('arg1') + " <> " + this.sqlValue('arg2');
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'GtToSQLRefinement',
  refines: 'foam.mlang.predicate.Gt',
  methods: [
    function toSQL() {
      return this.sqlValue('arg1') + ' > ' + this.sqlValue('arg2');
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'GteToSQLRefinement',
  refines: 'foam.mlang.predicate.Gte',
  methods: [
    function toSQL() {
      return this.sqlValue('arg1') + ' >= ' + this.sqlValue('arg2');
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LtToSQLRefinement',
  refines: 'foam.mlang.predicate.Lt',
  methods: [
    function toSQL() {
      return this.sqlValue('arg1') + ' < ' + this.sqlValue('arg2');
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LteToSQLRefinement',
  refines: 'foam.mlang.predicate.Lte',
  methods: [
    function toSQL() {
      return this.sqlValue('arg1') + ' <= ' + this.sqlValue('arg2');
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'AndToSQLRefinement',
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
  package: 'foam.dao',
  name: 'OrToSQLRefinement',
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
  package: 'foam.dao',
  name: 'InToSQLRefinement',
  refines: 'foam.mlang.predicate.In',
  methods: [
    function toSQL() {
      var s = this.sqlValue('arg1');
      s += ' IN ( \'';
      if ( Array.isArray(this.arg2) ) {
        s += this.arg2.join('\', \'');
      } else {
        s += this.sqlValue('arg2');
      }
      s += '\')';
      return s;
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DateToSQLRefinement',
  refines: 'foam.core.Date',
  methods: [
    function toSQL() {
      var v1 = this.value || 0;
      return new Date(v1).toISOString();
    }
  ]
});
