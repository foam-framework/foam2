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
    }
  ]
});

foam.LIB({
  name: 'foam.String',

  methods: [
    function toDatastoreValue(s) { return { stringValue: s }; }
  ]
});

foam.LIB({
  name: 'foam.Array',

  methods: [
    function toDatastoreValue(a) {
      var values = new Array(a.length);
      for ( var i = 0; i < a.length; i++) {
        values[i] = foam.util.datastoreValue(a[i]);
      }
      return { arrayValue: { values: values } };
    }
  ]
});

foam.LIB({
  name: 'foam.Date',

  methods: [
    function toDatastoreValue(d) { return { timestampValue: d.toISOString() }; }
  ]
});

foam.LIB({
  name: 'foam.core.FObject',

  methods: [
    function toDatastoreValue(o) { return o.toDatastoreValue(); }
  ]
});

//
// Extend foam.util to implement datastoreValue(o).
//

foam.LIB({
  name: 'foam.util',

  methods: [
    function datastoreValue(o) {
      var t = foam.typeOf(o);
      if ( ! ( t && t.toDatastoreValue ) ) {
        throw new Error('Attempt to compute datastore value from ' +
            'incompatible type');
      }

      return t.toDatastoreValue(o);
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
    function getDatastoreKind() {
      return this.cls_.id;
    },
    function getOwnDatastoreKey() {
      if ( ! ( this.model_.ids || this.id ) ) {
        throw new Error('Attempt to construct datastore key from ' +
            'unidentified object');
      }
      var ids = this.model_.ids;
      if ( ! ids )
        return { kind: this.getDatastoreKind(), name: this.id.toString() };

      var name = new Array(ids.length);
      for ( var i = 0; i < ids.length; i++ ) {
        name = ids[i] + ( i < ids.length - 1 ? ':' : '' );
      }
      return { kind: this.getDatastoreKind(), name: name };
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
        if ( ps[i].networkTransient ) continue;

        var value = ps[i].f(this);
        if ( ps[i].isDefaultValue(value) ) continue;

        properties[ps[i].name] = foam.util.datastoreValue(value);
      }

      return { key: this.getDatastoreKey(), properties: properties };
    },
    function toDatastoreValue() {
      return { entityValue: this.toDatastoreEntity() };
    }
  ]
});
