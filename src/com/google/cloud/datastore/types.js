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
// Refine stdlib types to implement toDatastoreValue(o).
//

foam.LIB({
  name: 'foam.Undefined',

  methods: [
    function toDatastoreValue() {
      throw new Error('Attempt to use undefined as datastore value');
    }
  ]
});

foam.LIB({
  name: 'foam.Null',

  methods: [
    {
      name: 'toDatastoreValue',
      code: (function() {
        var NULL = {nullValue: null};
        return function toDatastoreValue() { return NULL; };
      })()
    },
    function fromDatastoreValue() {
      return null;
    }
  ]
});

foam.LIB({
  name: 'foam.Boolean',

  methods: [
    {
      name: 'toDatastoreValue',
      code: (function() {
        var TRUE = {booleanValue: true};
        var FALSE = {booleanValue: false};
        return function toDatastoreValue(b) { return b ? TRUE : FALSE; };
      })()
    },
    function fromDatastoreValue(v) {
      return v.booleanValue;
    }
  ]
});

foam.LIB({
  name: 'foam.Function',

  methods: [
    function toDatastoreValue(f) { return { stringValue: f.toString() }; }
  ]
});

foam.LIB({
  name: 'foam.Number',

  methods: [
    function toDatastoreValue(n) {
      return Number.isInteger(n) ? { integerValue: n.toString(10) } :
          {doubleValue: n};
    },
    function fromDatastoreValue(v) {
      if (v.doubleValue !== undefined) return v.doubleValue;
      return parseInt(v.integerValue);
    }
  ]
});

foam.LIB({
  name: 'foam.String',

  methods: [
    function toDatastoreValue(s) { return { stringValue: s }; },
    function fromDatastoreValue(v) { return v.stringValue; }
  ]
});

foam.LIB({
  name: 'foam.Array',

  methods: [
    function toDatastoreValue(a) {
      var values = new Array(a.length);
      for ( var i = 0; i < a.length; i++) {
        values[i] = com.google.cloud.datastore.toDatastoreValue(a[i]);
      }
      return { arrayValue: { values: values } };
    },
    function fromDatastoreValue(v) {
      var values = v.arrayValue;
      var arr = new Array(values.length);
      for ( var i = 0; i < values.length; i++ ) {
        arr[i] = com.google.cloud.datastore.fromDatastoreValue(values[i]);
      }
      return arr;
    }
  ]
});

foam.LIB({
  name: 'foam.Date',

  methods: [
    function toDatastoreValue(d) {
      return { timestampValue: d.toISOString() };
    },
    function fromDatastoreValue(v) {
      return new Date(Date.parse(v.timestampValue));
    }
  ]
});

foam.LIB({
  name: 'foam.core.FObject',

  methods: [
    function toDatastoreValue(o) { return o.toDatastoreValue(); },
    function fromDatastoreValue(v) {
      return this.fromDatastoreEntity(v.entityValue);
    },
    function fromDatastoreEntity(entity) {
      var keys = entity.key.path;
      var key = keys[keys.length - 1];
      var cls = foam.lookup(key.kind);
      var id = key.name;

      var o = cls.create();

      if ( cls.ids && cls.ids.length > 1 ) {
        throw new Error('Not implemented: Deserialization of Cloud Datastore ' +
            'multi-part ids');
      }

      var idProp = cls.ids && cls.ids.length === 1 ?
          cls.getAxiomByName(cls.ids[0]) :
          cls.getAxiomByName('id');

      if ( idProp ) o[idProp.name] = id;

      var props = entity.properties;
      for ( var name in props ) {
        if ( props.hasOwnProperty(name) ) {
          o[name] = com.google.cloud.datastore.fromDatastoreValue(props[name]);
        }
      }

      return o;
    },
    function getOwnClassDatastoreKind() {
      return this.id;
    },
    function getClassDatastoreKind() {
      return { name: this.getOwnClassDatastoreKind() };
    }
  ]
});

//
// Provide base to/from datastore value operations.
//

foam.LIB({
  name: 'com.google.cloud.datastore',

  methods: [
    function toDatastoreValue(o) {
      var t = foam.typeOf(o);
      if ( ! ( t && t.toDatastoreValue ) ) {
        throw new Error('Attempt to compute datastore value from ' +
            'incompatible type');
      }

      return t.toDatastoreValue(o);
    },
    function fromDatastoreValue(v) {
      return this.typeOfDatastoreValue(v).fromDatastoreValue(v);
    },
    function fromDatastoreEntity(v) {
      return foam.core.FObject.fromDatastoreEntity(v);
    },
    {
      name: 'typeOfDatastoreValue',
      documentation: function() {/*
                                   Determine the primitive type of Value from
                                   Google Cloud Datastore REST API. These
                                   values are objects with one key denoting
                                   their Datastore representation; e.g.,
                                   "booleanValue", "integerValue", etc..

                                   https://cloud.google.com/datastore/docs/reference/rest/v1/projects/runQuery#value
                                  */},
      code: (function() {
        var typeMap = {
          nullValue: foam.Null,
          booleanValue: foam.Boolean,
          integerValue: foam.Number,
          doubleValue: foam.Number,
          timestampValue: foam.Date,
          stringValue: foam.String,
          entityValue: foam.core.FObject
        };
        return function typeOfDatastoreValue(v) {
          for ( var key in v ) {
            if ( typeMap[key] && v.hasOwnProperty(key) ) return typeMap[key];
          }

          throw new Error('Failed to identify type of datastore value: ' +
              JSON.stringify(v));
        };
      })()
    }
  ]
});

//
// Refine foam.core.FObject to support datastore's:
// (1) "kinds" (i.e., types);
// (2) "keys" (i.e., <type, name|auto-generated-id> pairs);
// (3) "entities" (i.e., objects);
// (4) "values" (i.e., primitives or entities).
//

foam.CLASS({
  refines: 'foam.core.FObject',

  methods: [
    function getOwnDatastoreKind() {
      return this.cls_.getOwnClassDatastoreKind();
    },
    function getDatastoreKind() {
      return this.cls_.getClassDatastoreKind();
    },
    function getOwnDatastoreKey() {
      if ( ! ( this.model_.ids || this.id ) ) {
        throw new Error('Attempt to construct datastore key from ' +
            'unidentified object');
      }
      var ids = this.model_.ids;
      if ( ! ids )
        return { kind: this.getOwnDatastoreKind(), name: this.id.toString() };

      var name = new Array(ids.length);
      for ( var i = 0; i < ids.length; i++ ) {
        name[i] = this[ids[i]];
      }
      return { kind: this.getOwnDatastoreKind(), name: name.join('_') };
    },
    function getDatastoreKey(opt_propertyPath) {
      if ( ! opt_propertyPath ) return { path: [ this.getOwnDatastoreKey() ] };

      var o = this;
      var path = new Array(opt_propertyPath.length + 1);

      path[0] = this.getOwnDatastoreKey();

      for ( var i = 0; i < opt_propertyPath.length; i++ ) {
        var next = opt_propertyPath[i];
        var o = ( typeof next === 'string' ) ? o[next] : next.f(o);

        if ( ! foam.core.FObject.isInstance(o) ) {
          throw new Error('Attempt to get datastore key from non-keyable ' +
              'object');
        }

        path[i + 1] = o.getOwnDatastoreKey();
      }

      return { path: path };
    },
    function toDatastoreEntity() {
      var properties = {};
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);

      for ( var i = 0; i < ps.length; i++ ) {
        // TODO(markdittmer): MLangs that refer to storageTransient
        // properties could cause the DatastoreDAO to misbehave. This could be
        // fixed by auditing predicates and throwing an error when they contain
        // properties that are dropped by the DAO processing the predicate.
        if ( ps[i].storageTransient ) continue;

        var value = ps[i].f(this);
        properties[ps[i].name] = com.google.cloud.datastore.toDatastoreValue(
            value);
      }

      return { key: this.getDatastoreKey(), properties: properties };
    },
    function toDatastoreValue() {
      return { entityValue: this.toDatastoreEntity() };
    }
  ]
});
