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
        var NULL = { nullValue: null };
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
        var TRUE = { booleanValue: true };
        var FALSE = { booleanValue: false };
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
          { doubleValue: n };
    },
    function fromDatastoreValue(v) {
      if ( v.value_type === 'doubleValue' || v.integerValue === undefined ) {
        foam.assert(v.doubleValue !== undefined,
                    'Non-integer number expects doubleValue');
        return v.doubleValue;
      }

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
    function fromDatastoreValue(v, opt_ctx) {
      var values = v.arrayValue.values || [];
      var arr = new Array(values.length);
      for ( var i = 0; i < values.length; i++ ) {
        arr[i] = com.google.cloud.datastore.fromDatastoreValue(
            values[i], opt_ctx);
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
      var tv = v.timestampValue;
      if ( typeof tv === 'string' )
        return new Date(Date.parse(tv));

      var seconds = parseInt(tv.seconds);
      var nanos = tv.nanos;
      foam.assert( ! isNaN(seconds),
                   'Expected non-string Datastore timestampValue to contain: ' +
                   '{ seconds: "<seconds-since-epoch>", nanos: <nanos> }');

      return new Date( ( seconds * 1000 ) + Math.floor(nanos / 1000000) );
    }
  ]
});

(function() {
  var MultiPartID = foam.core.MultiPartID;

  foam.LIB({
    name: 'foam.core.FObject',

    methods: [
      function toDatastoreValue(o) { return o.toDatastoreValue(); },
      function fromDatastoreValue(v, opt_ctx) {
        return this.fromDatastoreEntity(v.entityValue, opt_ctx);
      },
      function fromDatastoreEntity(entity, opt_ctx) {
        var keys = entity.key.path;
        var key = keys[keys.length - 1];
        var cls = foam.lookup(key.kind);
        var id = key.name;
        var idProp = cls.ids && cls.ids.length === 1 ?
            cls.getAxiomByName(cls.ids[0]) :
            cls.getAxiomByName('id');
        var opts = {};

        if ( idProp && ! MultiPartID.isInstance(idProp) )
          opts[idProp.name] = idProp.fromDatastoreKeyName(id);

        var props = entity.properties;
        for ( var name in props ) {
          if ( props.hasOwnProperty(name) ) {
            opts[name] = com.google.cloud.datastore.fromDatastoreValue(
                props[name], opt_ctx);
          }
        }

        return cls.create(opts, opt_ctx);
      },
      function getOwnClassDatastoreKind() {
        return this.id;
      },
      function getClassDatastoreKind() {
        return { name: this.getOwnClassDatastoreKind() };
      }
    ]
  });
})();

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
    function fromDatastoreValue(v, opt_ctx) {
      return this.typeOfDatastoreValue(v).fromDatastoreValue(v, opt_ctx);
    },
    function fromDatastoreEntity(v, opt_ctx) {
      return foam.core.FObject.fromDatastoreEntity(v, opt_ctx);
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
          arrayValue: foam.Array,
          entityValue: foam.core.FObject
        };
        return function typeOfDatastoreValue(v) {
          if ( v.hasOwnProperty('value_type') ) {
            foam.assert(typeMap[v.value_type],
                        'Expected datastore value with "value_type" to have ' +
                        'known type; value_type = ' + v.value_type);
            return typeMap[v.value_type];
          }
          for ( var key in v ) {
            if ( typeMap[key] && v.hasOwnProperty(key) ) return typeMap[key];
          }

          throw new Error('Failed to identify type of datastore value: ' +
              JSON.stringify(v));
        };
      })()
    },
    {
      name: 'toDatastoreKeyName',
      code: foam.mmethod({
        Number: function(n) { return n + ''; },
        String: function(str) { return str; },
        FObject: function(o) {
          var idProp = o.cls_.ID;
          if ( ! idProp ) {
            throw new Error('Attempt to construct datastore key from ' +
                'unidentified object');
          }
          return idProp.toDatastoreKeyName(o);
        },
        Array: function(a) {
          throw new Error('Multi-part keys must be derived from objects, not values');
        },
        Object: function(o) {
          throw new Error('Cannot convert plain object to datastore key name');
        }
      }, function(o) {
        throw new Error('Cannot convert ' + o + ' to datastore key name');
      })
    }
  ]
});

//
// Refine properties and multi-part ids to support conversion:
// property-on-object => datastore-key-name
//

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'PropertyDatastoreTypesRefinement',
  refines: 'foam.core.Property',

  methods: [
    {
      name: 'toDatastoreKeyName',
      documentation: `Construct a Datastore Key PathElement "name" from this
        property. I.e.,
        https://cloud.google.com/datastore/docs/reference/rest/v1/Key#PathElement
        "name" property.`,
      code: function(o) {
        return this.toDatastoreKeyNamePart(o);
      }
    },
    {
      name: 'toDatastoreKeyNamePart',
      documentation: `Provide this property's contribution to a composite
        Datastore Key PathElement "name" from this property. This is used by
        MultiPartIDs to gather string fragments from multiple properies. See
        https://cloud.google.com/datastore/docs/reference/rest/v1/Key#PathElement
        "name" property for Datastore API usage details.`,
      code: function(o) {
        return this.f(o).toString();
        return this.toDatastoreKeyNamePart(o);
      }
    }
  ]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'DateDatastoreTypesRefinement',
  refines: 'foam.core.Date',

  methods: [
    function toDatastoreKeyNamePart(o) {
      return this.f(o).toISOString();
    }
  ]
});

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'MultiPartIDDatastoreTypesRefinement',
  refines: 'foam.core.MultiPartID',

  properties: [
    {
      class: 'String',
      name: 'stringSeparator',
      value: ':'
    }
  ],

  methods: [
    function toDatastoreKeyName(o) {
      var sep = this.stringSeparator;
      var props = this.props;
      var str = '';
      for ( var i = 0; i < props.length; i++ ) {
        str += props[i].toDatastoreKeyNamePart(o);
        if ( i !== props.length - 1 ) str += sep;
      }
      return str;
    },
    function fromDatastoreKeyName(name) {
      return name.split(this.stringSeparator);
    }
  ]
});

//
// Refine Enum values to output integer: enumValue.ordinal.
//

foam.CLASS({
  package: 'com.google.cloud.datastore',
  name: 'AbstractEnumDatastoreTypesRefinement',
  refines: 'foam.core.AbstractEnum',

  methods: [
    function toDatastoreValue() {
      return { integerValue: this.ordinal };
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
  package: 'com.google.cloud.datastore',
  name: 'FObjectDatastoreTypesRefinement',
  refines: 'foam.core.FObject',

  methods: [
    function getOwnDatastoreKind() {
      return this.cls_.getOwnClassDatastoreKind();
    },
    function getDatastoreKind() {
      return this.cls_.getClassDatastoreKind();
    },
    function getOwnDatastoreKey() {
      return {
        kind: this.getOwnDatastoreKind(),
        name: com.google.cloud.datastore.toDatastoreKeyName(this)
      };
    },
    function getDatastoreKey(partitionId, opt_propertyPath) {
      if ( ! opt_propertyPath ) {
        return {
          partitionId: partitionId,
          path: [ this.getOwnDatastoreKey() ]
        };
      }

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

      return { partitionId: partitionId, path: path };
    },
    function toDatastoreEntity(partitionId) {
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

      return { key: this.getDatastoreKey(partitionId), properties: properties };
    },
    function toDatastoreValue() {
      return { entityValue: this.toDatastoreEntity() };
    },
    function fromDatastoreKeyName(name) { return name; }
  ]
});
