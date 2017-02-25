/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

//
// Refine AND and subset of binary ops to support toDatastoreFilter().
//

foam.CLASS({
  refines: 'foam.mlang.predicate.AbstractPredicate',

  methods: [
    function toDatastoreFilter() {
      throw new Error('Predicate not supported in datastore implementation: ' +
          this.cls_.id);
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.predicate.And',

  methods: [
    function toDatastoreFilter() {
      var filters = new Array(this.args.length);

      for ( var i = 0; i < this.args.length; i++ ) {
        filters[i] = this.args[i].toDatastoreFilter();
      }

      return { op: 'AND', filters: filters };
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.predicate.Binary',

  properties: [
    {
      class: 'String',
      name: 'datastoreOpName',
      value: ''
    }
  ],

  methods: [
    function toDatastoreFilter() {
      foam.assert(foam.core.Property.isInstance(this.arg1),
          'Left-hand-side of datastore binary op is not a property');
      foam.assert(this.datastoreOpName,
          'Predicate has no datastore op name:', this.cls_.id);

      return {
        property: this.arg1.toDatastoreProperty(),
        op: this.datastoreOpName,
        value: foam.util.datastoreValue(this.arg2)
      };
    }
  ]
});

(function() {
  var ops = [
    ['Eq', 'EQUAL'],
    ['Lt', 'LESS_THAN'],
    ['Lte', 'LESS_THAN_OR_EQUAL'],
    ['Gt', 'GREATER_THAN'],
    ['Gte', 'GREATER_THAN_OR_EQUAL']
  ];
  var predicatePackage = foam.mlang.predicate;

  for ( var i = 0; i < ops.length; i++ ) {
    var op = ops[i];
    var id = 'foam.mlang.predicate.' + op[0];
    foam.CLASS({
      refines: id,
      properties: [
        {
          class: 'String',
          name: 'datastoreOpName',
          value: op[1]
        }
      ]
    });
  }
})();

foam.CLASS({
  refines: 'foam.core.Property',

  methods: [
    function toDatastoreOrder() {
      return this.orderDirection === 1 ?
          { property: { name: this.name } } :
          { property: { name: this.name }, direction: 'DESCENDING' };
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.order.ThenBy',

  methods: [
    function toDatastoreOrder() {
      var order1 = this.arg1.toDatastoreOrder();
      var order2 = this.arg2.toDatastoreOrder();
      if ( ! Array.isArray(order1) ) order1 = [ order1 ];
      if ( ! Array.isArray(order2) ) order2 = [ order2 ];
      return order1.concat(order2);
    }
  ]
});
