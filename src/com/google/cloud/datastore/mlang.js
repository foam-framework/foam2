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
// Refine COUNT to perform two optimizations:
// (1) Perform a key-only query when the sink is a COUNT;
// (2) Do not bother construction FObjects on query result batches.
//

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'CountDatastoreRefinement',
  refines: 'foam.mlang.sink.Count',

  methods: [
    {
      name: 'decorateDatastoreQuery',
      documentation: `Optimize plain COUNT() queries by requesting keys only.
          This entails filling in runQuery.projection [1] with the magic
          "__key__" key.

          [1] https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#Projection`,
      code: function(query) {
        query.projection = [ { property: { name: "__key__" } } ];
      }
    },
    {
      name: 'fromDatastoreEntityResults',
      documentation: `Optimize plain COUNT() queries by not constructing
          FObjects to store results. Input paramter is
          QueryResultBatch.entityResults [1].

          [1] https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#QueryResultBatch`,
      code: function(entityResults) { this.value += entityResults.length; }
    }
  ]
});

//
// Refine Property and DOT to produce datastore property.
//

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'PropertyDatastoreRefinement',
  refines: 'foam.core.Property',

  methods: [
    {
      name: 'toDatastorePropertyReference',
      documentation:
      function() {/*
                    Provides a PropertyReference for the Cloud Datastore REST
                    API.
                    https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#PropertyReference
                  */},
      code: function() { return { name: this.name }; }
    }
  ]
});


foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'DotDatastoreRefinement',
  refines: 'foam.mlang.expr.Dot',

  methods: [
    {
      name: 'toDatastorePropertyReference',
      code: function() {
        return { name: this.arg1.name + '.' + this.arg2.name };
      }
    }
  ]
});


//
// Refine constants to produce datastore values. This is needed because
// mLangs will attempt to access datastore values on the arguments.
//

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'ConstantDatastoreRefinement',
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
  package: 'com.google.cloud.datastore',
  name: 'AbstractPredicateDatastoreRefinement',
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
  package: 'com.google.cloud.datastore',
  name: 'AndDatastoreRefinement',
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
  package: 'com.google.cloud.datastore',
  name: 'BinaryDatastoreRefinement',
  refines: 'foam.mlang.predicate.Binary',

  properties: [
    {
      class: 'String',
      visibility: 'HIDDEN',
      documentation: `Provides Operator for the Cloud Datastore REST API.
          https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#Operator_1`,
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
        property: this.arg1.toDatastorePropertyReference(),
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

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'EqDatastoreRefinement',
  refines: 'foam.mlang.predicate.Eq',
  properties: [ {class: 'String', name: 'datastoreOpName', value: 'EQUAL' }]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'LtDatastoreRefinement',
  refines: 'foam.mlang.predicate.Lt',
  properties: [ {class: 'String', name: 'datastoreOpName', value: 'LESS_THAN' }]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'LteDatastoreRefinement',
  refines: 'foam.mlang.predicate.Lte',
  properties: [ {class: 'String', name: 'datastoreOpName', value: 'LESS_THAN_OR_EQUAL' }]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'GtDatastoreRefinement',
  refines: 'foam.mlang.predicate.Gt',
  properties: [ {class: 'String', name: 'datastoreOpName', value: 'GREATER_THAN' }]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'GteDatastoreRefinement',
  refines: 'foam.mlang.predicate.Gte',
  properties: [ {class: 'String', name: 'datastoreOpName', value: 'GREATER_THAN_OR_EQUAL' }]
});


//
// Refine properties and ThenBy mLang to behave as orderings.
//

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'PropertyToDataStoreOrderRefinement',
  refines: 'foam.core.Property',

  methods: [
    {
      name: 'toDatastoreOrder',
      documentation:
      function() {/*
                    Provides PropertyOrder for the Cloud Datastore REST API.
                    https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#propertyorder
                  */},
      code: function(opt_orderDirection) {
        var orderDirection = opt_orderDirection || 1;
        return orderDirection === 1 ?
            [ { property: { name: this.name } } ] :
            [ { property: { name: this.name }, direction: 'DESCENDING' } ];
      }
    }
  ]
});


foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'DescDatastoreRefinement',
  refines: 'foam.mlang.order.Desc',

  methods: [
    function toDatastoreOrder(opt_orderDirection) {
      var orderDirection = -1 * (opt_orderDirection || 1);
      return this.arg1.toDatastoreOrder(orderDirection);
    }
  ]
});


foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'ThenByDatastoreRefinement',
  refines: 'foam.mlang.order.ThenBy',

  methods: [
    function toDatastoreOrder(opt_orderDirection) {
      var order1 = this.head.toDatastoreOrder(opt_orderDirection);
      var order2 = this.tail.toDatastoreOrder(opt_orderDirection);
      return order1.concat(order2);
    }
  ]
});
