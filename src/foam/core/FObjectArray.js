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
  extends: 'Property',

  documentation: "A Property which contains an array of 'of' FObjects.",

  properties: [
    { name: 'of', required: true },
    {
      name: 'type',
      factory: function() {
        return this.of + '[]';
      }
    },
    [
      'factory',
      function() { return []; }
    ],
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
      return cls.isInstance(o) ? o : cls.create(o, obj);
    }],
    {
      name: 'fromJSON',
      value: function(value, ctx, prop) {
        return foam.json.parse(value, prop.of, ctx);
      }
    }
  ],

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);
      var self = this;
      Object.defineProperty(proto, self.name + '$push', {
        get: function classGetter() {
          return function (v) {
            // Push value
            this[self.name].push(v);
            // Force property update
            this[self.name] = this[self.name];
          }
        },
        configurable: true
      });
      Object.defineProperty(proto, self.name + '$remove', {
        get: function classGetter() {
          return function (predicate) {
            // Faster than splice or filter as of the time this was added
            let oldArry = this[self.name];
            let newArry = [];
            for ( let i=0; i < oldArry.length; i++ ) {
              if ( ! predicate.f(oldArry[i]) ) {
                newArry.push(oldArry[i]);
              }
            }
            this[self.name] = newArry;
          }
        },
        configurable: true
      });
    }
  ]
});
