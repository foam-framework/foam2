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

foam.CLASS({refines: 'foam.mlang.predicate.Eq',  properties: [ {class: 'String', name: 'datastoreOpName', value: 'EQUAL' }] });
foam.CLASS({refines: 'foam.mlang.predicate.Lt',  properties: [ {class: 'String', name: 'datastoreOpName', value: 'LESS_THAN' }] });
foam.CLASS({refines: 'foam.mlang.predicate.Lte', properties: [ {class: 'String', name: 'datastoreOpName', value: 'LESS_THAN_OR_EQUAL' }] });
foam.CLASS({refines: 'foam.mlang.predicate.Gt',  properties: [ {class: 'String', name: 'datastoreOpName', value: 'GREATER_THAN' }] });
foam.CLASS({refines: 'foam.mlang.predicate.Gte', properties: [ {class: 'String', name: 'datastoreOpName', value: 'GREATER_THAN_OR_EQUAL' }] });


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
