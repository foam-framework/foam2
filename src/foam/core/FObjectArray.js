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
  package: 'foam.core',
  name: 'FObjectArray',
  extends: 'foam.core.Array',

  documentation: "A Property which contains an array of 'of' FObjects.",

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);
      var self = this;
      Object.defineProperty(proto, self.name + '$' + 'errors', {
        get: function getArrayErrorSlot() {
          // errors_$ will be updated with an array member's error_$ slot
          var errors_$ = foam.core.SimpleSlot.create({ value: [] });
          // sub will be replaced when the array changes
          var sub = foam.core.FObject.create();

          // Safely combine error lists and update error_$
          var setErrors = errorLists => {
            errors_$.set(errorLists.flat(1).filter(v => v));
          };
          // Handle an array property update
          var subToArray = val => {
            setErrors(val.map(v => v.errors_));
            sub.onDetach(foam.core.ArraySlot.create({
              slots: val.map(v => v.errors_$)
            }).map(errorLists => {
              setErrors(errorLists);
            }));
          };
          // Initialize slot listener
          var val = this[self.name];
          if ( Array.isArray(val) ) subToArray(val);
          this.slot(self.name).sub(() => {
            sub.detach();
            sub = foam.core.FObject.create();
            var val = this[self.name];
            if ( Array.isArray(val) ) subToArray(val);
          })
          return errors_$;
        },
        configurable: true
      })
    }
  ],

  properties: [
    { name: 'of', required: true },
    {
      name: 'type',
      factory: function() {
        return this.of + '[]';
      }
    },
    [ 'adapt', function(_, /* array? */ a, prop) {
        if ( ! a ) return [];
        // If not an array, allow assertValue to assert the type-check.
        if ( ! Array.isArray(a) ) return a;

        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = prop.adaptArrayElement(a[i], this);
        }
        return b;
      }
    ],
    [ 'assertValue', function(v, prop) {
        foam.assert(Array.isArray(v),
            prop.name, 'Attempt to set array property to non-array value', v);
      }
    ],
    [ 'adaptArrayElement', function(o, obj) {
      // FUTURE: replace 'foam.' with '(this.__subContext__ || foam).' ?
      var ctx = obj.__subContext__ || foam;
      var of = o.class || this.of;
      var cls = ctx.lookup(of);
      if ( cls == null ) cls = obj[of];
      return cls.isInstance(o) ? o : cls.create(o, obj);
    }],
    {
      name: 'fromJSON',
      value: function(value, ctx, prop) {
        return foam.json.parse(value, prop.of, ctx);
      }
    }
  ]
});
