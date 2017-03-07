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
// Refine Property and DOT to produce datastore property.
//

foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'String',
      name: 'datastoreName',
      documentation:
      function() {/*
                    The PropertyType.name for the Cloud Datastore REST
                    API. I.e., "name" key in
                    https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#PropertyReference
                  */},
      factory: function() { return this.name; }
    },
    {
      name: 'datastoreProperty',
      function() {/*
                    Provides a PropertyType for the Cloud Datastore REST
                    API.
                    https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#PropertyReference
                  */},
      factory: function() { return { name: this.datastoreName }; }
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.expr.Dot',

  properties: [
    {
      name: 'datastoreName',
      factory: function() {
        return this.arg1.datastoreName + '.' + this.arg2.datastoreName;
      },
    },
    {
      name: 'datastoreProperty',
      factory: function() { return { name: this.datastoreName() }; }
    }
  ],
});

//
// Refine constants to produce datastore values. This is needed because
// mLangs will attempt to access datastore values on the arguments.
//

foam.CLASS({
  refines: 'foam.mlang.Constant',

  methods: [
    {
      name: 'toDatastoreValue',
      documentation:
      function() {/*
                    Provides Value for the Cloud Datastore REST API.
                    https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#Value
                  */},
      code: function() {
        return com.google.cloud.datastore.toDatastoreValue(this.value);
      }
    }
  ]
});

//
// Refine AND and subset of binary ops to support toDatastoreFilter().
//

foam.CLASS({
  refines: 'foam.mlang.predicate.AbstractPredicate',

  methods: [
    {
      name: 'toDatastoreFilter',
      documentation:
      function() {/*
                    Provides Filter for the Cloud Datastore REST API.
                    https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#filter
                  */},
      code: function() {
        throw new Error('Predicate not supported in datastore ' +
            'implementation: ' + this.cls_.id);
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.predicate.And',

  methods: [
    {
      name: 'toOwnDatastoreFilter',
      documentation:
      function() {/*
                    Provides (CompositeFilter|PropertyFilter) for a Filter in
                    the Cloud Datastore REST API.
                    https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#filter
                  */},
      code: function() {
        var filters = new Array(this.args.length);

        for ( var i = 0; i < this.args.length; i++ ) {
          filters[i] = this.args[i].toDatastoreFilter();
        }

        return { op: 'AND', filters: filters };
      }
    },
    function toDatastoreFilter() {
      return { compositeFilter: this.toOwnDatastoreFilter() };
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.predicate.Binary',

  properties: [
    {
      class: 'String',
      function() {/*
                    Provides Operator for the Cloud Datastore REST API.
                    https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#Operator_1
                  */},
      name: 'datastoreOpName'
    }
  ],

  methods: [
    function toOwnDatastoreFilter() {
      foam.assert(foam.core.Property.isInstance(this.arg1),
          'Left-hand-side of datastore binary op is not a property');
      foam.assert(this.datastoreOpName,
          'Predicate has no datastore op name:', this.cls_.id);

      return {
        property: this.arg1.datastoreProperty,
        op: this.datastoreOpName,
        value: com.google.cloud.datastore.toDatastoreValue(this.arg2)
      };
    },
    function toDatastoreFilter() {
      return { propertyFilter: this.toOwnDatastoreFilter() };
    }
  ]
});

//
// Use above Binary implementation on Google Cloud Datastore-supported
// predicates by refining them with a particular "datastoreOpName" value.
//

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

//
// Refine properties and ThenBy mLang to behave as orderings.
//

foam.CLASS({
  refines: 'foam.core.Property',

  methods: [
    {
      name: 'toDatastoreOrder',
      documentation:
      function() {/*
                    Provides PropertyOrder for the Cloud Datastore REST API.
                    https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#propertyorder
                  */},
      code: function() {
      return this.orderDirection() === 1 ?
          [ { property: { name: this.name } } ] :
          [ { property: { name: this.name }, direction: 'DESCENDING' } ];
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.order.ThenBy',

  methods: [
    function toDatastoreOrder() {
      var order1 = this.arg1.toDatastoreOrder();
      var order2 = this.arg2.toDatastoreOrder();
      return order1.concat(order2);
    }
  ]
});
