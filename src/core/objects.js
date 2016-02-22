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

foam.CLASS({
  refines: 'foam.core.FObject',

  documentation: 'Add utility methods to FObject.',

  methods: [
    function equals(other) { return this.compareTo(other) == 0; },

    function compareTo(other) {
      if ( other === this ) return 0;

      if ( this.model_ !== other.model_ ) {
        // TODO: This provides unstable ordering if two objects have a different model_
        // but they have the same id.
        return this.model_.id.compareTo(other.model_ && other.model_.id) || 1;
      }

      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var r = ps[i].compare(this, other);
        if ( r ) return r;
      }

      return 0;
    },

    function diff(other) {
      var diff = {};

      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0, property ; property = ps[i] ; i++ ) {
        var value = property.f(this);
        var otherVal = property.f(other);
        if ( Array.isArray(value) ) {
          var subdiff = value.diff(otherVal);
          if ( subdiff.added.length !== 0 || subdiff.removed.length !== 0 ) {
            diff[property.name] = subdiff;
          }
          continue;
        }
        // if the primary value is undefined, use the compareTo of the other
        if ( typeof value !== 'undefined' ) {
          if ( value.compareTo(otherVal) !== 0) diff[property.name] = otherVal;
        } else if ( typeof otherVal !== 'undefined' ) {
          if ( otherVal.compareTo(value) !== 0) diff[property.name] = otherVal;
        } // else they are both undefined and thus not different
      }

      return diff;
    },

    function hashCode() {
      var hash = 17;

      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var prop = this[ps[i].name];
        var code = ! prop ? 0 :
          prop.hashCode   ? prop.hashCode()
                          : prop.toString().hashCode();

        hash = ((hash << 5) - hash) + code;
        hash &= hash;
      }

      return hash;
    },

    /** Create a deep copy of this object. **/
    function clone() {
      var m = {};
      for ( var key in this.instance_ ) {
        var value = this[key];
        if ( value !== undefined ) {
          var prop = this.cls_.getAxiomByName(key);
          if ( prop && prop.cloneProperty )
            prop.cloneProperty(value, m);
          else
            m[key] = value;
        }
      }
      return this.cls_.create(m/*, this.X*/);
    },
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',

  documentation: 'Add cloning to Properties.',

  methods: [
    function cloneProperty(
      /* any // The value to clone */         value,
      /* object // Add values to this map to
         have them installed on the clone. */ cloneMap
    ) {
      /** Override to provide special deep cloning behavior. */
      cloneMap[this.name] = ( value && value.clone ) ? value.clone() : value;
    },

  ]
});
